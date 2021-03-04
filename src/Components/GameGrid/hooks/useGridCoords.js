import { useEffect, useMemo } from "react";
import { nRows, nCols } from "../../../shared/gridConfig";
import getInitialGameMatrix from "./getInitialGameMatrix";

function useGridCoords() {
  const headerCoords = useMemo(() => [], []);
  const gameMatrixCoords = useMemo(() => getInitialGameMatrix(), []);

  useEffect(() => {
    const setHeaderCoords = () => {
      for (let y = 0; y < nCols; y++) {
        const th = document.getElementsByClassName("header" + y)[0];
        const thRect = th.getBoundingClientRect();
        headerCoords[y] = {
          y: thRect.y,
          l: thRect.x,
          r: thRect.x + thRect.width,
        };
      }
    };
    setHeaderCoords();

    const setGameMatrixCoords = () => {
      for (let y = 0; y < nRows; y++) {
        for (let x = 0; x < nCols; x++) {
          const td = document.getElementsByClassName(`cell_${x}_${y}`)[0];
          const tdRect = td.getBoundingClientRect();
          // console.log(tdRect);
          gameMatrixCoords[y][x] = {
            x: tdRect.x,
            y: tdRect.y,
          };
        }
      }
    };
    setGameMatrixCoords();
  }, [headerCoords, gameMatrixCoords]);

  return { headerCoords, gameMatrixCoords };
}

export default useGridCoords;
