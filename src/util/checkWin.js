import { xGridMax, yGridMax } from "../shared/gridConfig";

const minVal = (val, lowerBounds = 0) => {
  return val < lowerBounds ? lowerBounds : val;
};

const maxVal = (val, upperBounds) => {
  return val > upperBounds ? upperBounds : val;
};

const checkWinHorizontal = ({ lastMove, gameMatrix, currentPlayer }) => {
  // HORIZONTAL
  let xMin = minVal(lastMove.x - 3, 0);
  let xMax = maxVal(lastMove.x + 3, xGridMax);
  let yMin = lastMove.y;
  let yMax = lastMove.y;
  let matches = [];

  for (let x = xMin; x <= xMax; x++) {
    for (let y = yMin; y <= yMax; y++) {
      let gridVal = gameMatrix[y][x];
      if (gridVal === currentPlayer) {
        matches.push({
          x,
          y,
        });
      } else if (matches.length < 4) {
        matches = [];
      }
    }
  }

  return { winner: matches.length > 3 ? currentPlayer : null, matches };
};

const checkWinVertical = ({ lastMove, gameMatrix, currentPlayer }) => {
  // HORIZONTAL
  let xMin = lastMove.x;
  let xMax = lastMove.x;
  let yMin = minVal(lastMove.y - 3, 0);
  let yMax = maxVal(lastMove.y + 3, yGridMax);
  let matches = [];

  for (let x = xMin; x <= xMax; x++) {
    for (let y = yMin; y <= yMax; y++) {
      let gridVal = gameMatrix[y][x];
      if (gridVal === currentPlayer) {
        matches.push({
          x,
          y,
        });
      } else if (matches.length < 4) {
        matches = [];
      }
    }
  }

  return { winner: matches.length > 3 ? currentPlayer : null, matches };
};

const checkWinPositiveDiagonal = ({ lastMove, gameMatrix, currentPlayer }) => {
  // Positive Diagonal
  let xMin = minVal(lastMove.x - 3, 0);
  let xMax = maxVal(lastMove.x + 3, xGridMax);
  let yMin = minVal(lastMove.y - 3, 0);
  let yMax = maxVal(lastMove.y + 3, yGridMax);
  let matches = [];

  // eslint-disable-next-line no-sequences
  for (let y = yMax, x = xMin; y <= yMax, x <= xMax; x++, y--) {
    if (y <= yMax && y >= yMin && x <= xMax && x >= xMin) {
      let gridVal = gameMatrix[y][x];
      if (gridVal === currentPlayer) {
        matches.push({
          x,
          y,
        });
      } else if (matches.length < 4) {
        matches = [];
      }
    }
  }

  return { winner: matches.length > 3 ? currentPlayer : null, matches };
};

const checkWinNegativeDiagonal = ({ lastMove, gameMatrix, currentPlayer }) => {
  // Negative Diagonal
  let xMin = minVal(lastMove.x - 3, 0);
  let xMax = maxVal(lastMove.x + 3, xGridMax);
  let yMin = minVal(lastMove.y - 3, 0);
  let yMax = maxVal(lastMove.y + 3, yGridMax);
  let matches = [];

  // eslint-disable-next-line no-sequences
  for (let y = yMax, x = xMax; y >= yMin, x >= xMin; x--, y--) {
    if (y <= yMax && y >= yMin && x <= xMax && x >= xMin) {
      let gridVal = gameMatrix[y][x];
      if (gridVal === currentPlayer) {
        matches.push({
          x,
          y,
        });
      } else if (matches.length < 4) {
        matches = [];
      }
    }
  }

  return { winner: matches.length > 3 ? currentPlayer : null, matches };
};

const checkWin = ({ lastMove, gameMatrix, currentPlayer }) => {
  const results = [];
  results.push(
    checkWinHorizontal({
      lastMove,
      gameMatrix,
      currentPlayer,
    })
  );

  results.push(
    checkWinVertical({
      lastMove,
      gameMatrix,
      currentPlayer,
    })
  );

  results.push(
    checkWinPositiveDiagonal({
      lastMove,
      gameMatrix,
      currentPlayer,
    })
  );

  results.push(
    checkWinNegativeDiagonal({
      lastMove,
      gameMatrix,
      currentPlayer,
    })
  );

  let winningResult = null;

  results.forEach((result, key) => {
    if (result.winner) {
      winningResult = result;
    }
  });

  return winningResult;
};

const isWinningCoord = ({ cx, cy, winningCoords }) => {
  let isWin = false;
  winningCoords.forEach(({ x, y }) => {
    if (cx === x && cy === y) {
      isWin = true;
    }
  });
  return isWin;
};

export default checkWin;
export { isWinningCoord };
