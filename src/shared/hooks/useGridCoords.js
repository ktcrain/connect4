import { useEffect, useMemo, useCallback } from "react";
import { nRows, nCols } from "../gridConfig";
import getInitialGameMatrix from "../getInitialGameMatrix";
import useWindowSize from "./useWindowSize";

function useGridCoords() {
  const windowSize = useWindowSize();
  const headerCoords = useMemo(() => [], []);
  const gameMatrixCoords = useMemo(() => getInitialGameMatrix(), []);

  const setHeaderCoords = useCallback(() => {
    for (let y = 0; y < nCols; y++) {
      const th = document.getElementsByClassName("header" + y)[0];
      if (!th) return;
      const thRect = th.getBoundingClientRect();
      headerCoords[y] = {
        y: thRect.y,
        l: thRect.x,
        r: thRect.x + thRect.width,
      };
    }
  }, [headerCoords]);

  const setGameMatrixCoords = useCallback(() => {
    for (let y = 0; y < nRows; y++) {
      for (let x = 0; x < nCols; x++) {
        const td = document.getElementsByClassName(`cell_${x}_${y}`)[0];
        if (!td) return;
        const tdRect = td.getBoundingClientRect();
        // console.log(tdRect);
        gameMatrixCoords[y][x] = {
          x: tdRect.x,
          y: tdRect.y,
        };
      }
    }
  }, [gameMatrixCoords]);

  useEffect(() => {
    if (headerCoords.length > 0) return;
    setHeaderCoords();
    setGameMatrixCoords();
  });

  useEffect(() => {
    setHeaderCoords();
    setGameMatrixCoords();
  }, [windowSize, setHeaderCoords, setGameMatrixCoords]);

  return { headerCoords, gameMatrixCoords };
}

export default useGridCoords;
