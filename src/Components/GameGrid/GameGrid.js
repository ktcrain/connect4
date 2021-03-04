import React, { useEffect, useRef, useState } from "react";
import "./GameGrid.scss";
import _throttle from "lodash/throttle";
const classNames = require("classnames");

const nRows = 6;
const nCols = 7;
const xGridMin = 0;
const yGridMin = 0;
const xGridMax = nCols - 1;
const yGridMax = nRows - 1;
const headerXCoords = [];

const checkWinHorizontal = ({ lastMove, gameMatrix, currentPlayer }) => {
  // HORIZONTAL
  let xMin = minVal(lastMove.x - 3, 0);
  let xMax = maxVal(lastMove.x + 3, xGridMax);
  let yMin = lastMove.y;
  let yMax = lastMove.y;
  let matches = [];
  // console.log(xMin, xMax, yMin, yMax);

  for (let x = xMin; x <= xMax; x++) {
    for (let y = yMin; y <= yMax; y++) {
      let gridVal = gameMatrix[y][x];
      if (gridVal === currentPlayer) {
        matches.push({
          x,
          y,
        });
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
  // console.log(xMin, xMax, yMin, yMax);

  for (let x = xMin; x <= xMax; x++) {
    for (let y = yMin; y <= yMax; y++) {
      let gridVal = gameMatrix[y][x];
      if (gridVal === currentPlayer) {
        matches.push({
          x,
          y,
        });
      }
    }
  }

  return { winner: matches.length > 3 ? currentPlayer : null, matches };
};

const checkWinPositiveDiagonal = ({ lastMove, gameMatrix, currentPlayer }) => {
  // Positive Diagonal
  let xMin = minVal(lastMove.x - 3, 0);
  let xMax = maxVal(lastMove.x + 3, xGridMax);
  let yMin = minVal(lastMove.y, 0);
  let yMax = maxVal(lastMove.y + 3, yGridMax);
  let matches = [];
  console.log("checkWinPositiveDiagonal", xMin, xMax, yMin, yMax);

  for (let y = yMax, x = xMin; y <= yMax, x <= xMax; x++, y--) {
    if (y <= yMax && y >= yMin && x <= xMax && x >= xMin) {
      let gridVal = gameMatrix[y][x];
      if (gridVal === currentPlayer) {
        matches.push({
          x,
          y,
        });
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
  console.log("checkWinNegativeDiagonal", xMin, xMax, yMin, yMax);

  for (let y = yMax, x = xMax; y >= yMin, x >= xMin; x--, y--) {
    if (y <= yMax && y >= yMin && x <= xMax && x >= xMin) {
      console.log(x + "," + y);
      let gridVal = gameMatrix[y][x];
      if (gridVal === currentPlayer) {
        matches.push({
          x,
          y,
        });
      }
    }
  }

  return { winner: matches.length > 3 ? currentPlayer : null, matches };
};

const getInitialGameMatrix = () => {
  const gameMatrix = [];
  for (let h = 0; h < 6; h++) {
    const row = new Array(7).fill(0);
    gameMatrix.push(row);
  }
  return gameMatrix;
};

const minVal = (val, lowerBounds = 0) => {
  return val < lowerBounds ? lowerBounds : val;
};

const maxVal = (val, upperBounds) => {
  return val > upperBounds ? upperBounds : val;
};

function GameGrid() {
  const tableRef = useRef();

  const [gameMatrix, setGameMatrix] = useState(getInitialGameMatrix());
  const [activeColumn, setActiveColumn] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [lastMove, setLastMove] = useState(null);

  useEffect(() => {
    const setHeaderXCoords = () => {
      for (let h = 0; h <= 6; h++) {
        const td = document.getElementsByClassName("header" + h)[0];
        const tdRect = td.getBoundingClientRect();
        headerXCoords.push({
          l: tdRect.x,
          r: tdRect.x + tdRect.width,
        });
      }
    };
    setHeaderXCoords();
  }, []);

  useEffect(() => {
    const handleMove = () => {
      // [TODO] handle activeColumn mobile
      let foundSpot = false;
      for (let y = 5; y >= 0; y--) {
        const gridVal = gameMatrix[y][activeColumn];
        if (gridVal === 0 && foundSpot === false) {
          const gm = [...gameMatrix];
          gm[y][activeColumn] = currentPlayer;
          console.log(gm);
          setGameMatrix(gm);
          foundSpot = true;
          setLastMove({ x: activeColumn, y: y });
        }
      }
    };

    document.addEventListener("mousedown", handleMove);
    return () => document.removeEventListener("mousedown", handleMove);
  });

  useEffect(() => {
    const checkWinner = () => {
      if (lastMove === null) {
        return;
      }

      console.log("CHECKING WINNER");
      console.log("lastMove", lastMove);

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

      // console.log(results);
      results.forEach((result, key) => {
        console.log(key, result.matches);
        if (result.winner) {
          console.log("Player" + currentPlayer + " WINS!!!");
        }
      });

      switchPlayer();
    };
    const switchPlayer = () => {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    };
    checkWinner();
  }, [lastMove]);

  useEffect(() => {
    // const tableRect = tableRef.current.getBoundingClientRect();

    const dragToken = (e) => {
      const mouseCoords = {
        x: e.clientX,
        y: e.clientY,
      };

      headerXCoords.forEach((bound, i) => {
        if (bound.l <= mouseCoords.x && bound.r >= mouseCoords.x) {
          if (activeColumn !== i) {
            setActiveColumn(i);
          }
        }
      });
    };

    document.addEventListener("mousemove", _throttle(dragToken, 50));
    return () =>
      document.removeEventListener("mousemove", _throttle(dragToken, 50));
  });

  return (
    <div className="GameGrid">
      <table id="GameGridTable" ref={tableRef} className="GameGrid-Table">
        <thead>
          <tr id="GameGridTableHeader">
            {[0, 1, 2, 3, 4, 5, 6].map((h) => {
              const headerClasses = classNames({
                [`header${h}`]: true,
                active: h === activeColumn,
                [`player${currentPlayer}`]: true,
              });
              return (
                <td key={`thead${h}`} className={headerClasses}>
                  <span></span>
                </td>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {gameMatrix.map((row, rowIndex) => {
            return (
              <tr key={`col${rowIndex}`}>
                {row.map((v, colIndex) => {
                  const tdClasses = classNames({
                    highlight: colIndex === activeColumn,
                    [`player${v}`]: true,
                  });
                  return (
                    <td
                      className={tdClasses}
                      key={`slot_${rowIndex}_${colIndex}`}
                    >
                      <span>
                        {colIndex},{rowIndex}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default GameGrid;
