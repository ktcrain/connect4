import { yGridMax } from "../shared/gridConfig";

const findMoveCoords = ({ x, gameMatrix }) => {
  let foundSpot = false;
  for (let y = yGridMax; y >= 0; y--) {
    if (gameMatrix[y][x] === 0 && foundSpot === false) {
      foundSpot = true;
      return { x, y };
    }
  }
};

export default findMoveCoords;
