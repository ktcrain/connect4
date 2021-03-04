import React, { useEffect, useRef, useState } from "react";
import { nCols } from "../../../shared/gridConfig";

function useGridCoords() {
  const headerXCoords = [];

  useEffect(() => {
    const setHeaderXCoords = () => {
      for (let y = 0; y < nCols; y++) {
        const th = document.getElementsByClassName("header" + y)[0];
        const thRect = th.getBoundingClientRect();
        headerXCoords[y] = {
          l: thRect.x,
          r: thRect.x + thRect.width,
        };
      }
    };
    setHeaderXCoords();

    // const setGameMatrixCoords = () => {
    //   for (let y = 0; y < nCols; y++) {
    //     const td = document.getElementsByClassName("header" + y)[0];
    //     const tdRect = td.getBoundingClientRect();

    //   }
    // };
    // setGameMatrixCoords();
  }, []);

  return { headerXCoords };
}

export default useGridCoords;
