import React, { useEffect, useRef, useState } from "react";
import "./GameGrid.scss";
import _throttle from "lodash/throttle";
import { TweenMax } from "gsap";
import checkWin from "../../util/checkWin";
import { nRows, nCols, yGridMax } from "../../shared/gridConfig";
import getInitialGameMatrix from "./hooks/getInitialGameMatrix";

const classNames = require("classnames");

const headerXCoords = [];
const gameMatrixCoords = [];

function GameGrid() {
  const tableRef = useRef();

  const [gameStatus, setGameStatus] = useState("GAME_PLAYING");
  const [gameMatrix, setGameMatrix] = useState(getInitialGameMatrix());
  const [activeColumn, setActiveColumn] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [lastMove, setLastMove] = useState(null);
  const [winner, setWinner] = useState(null);
  const [winningCoords, setWinningCoords] = useState([]);

  const isWinningCoord = ({ cx, cy }) => {
    let isWin = false;
    winningCoords.forEach(({ x, y }) => {
      if (cx === x && cy === y) {
        isWin = true;
      }
    });
    return isWin;
  };

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

  useEffect(() => {
    const handleMove = () => {
      if (gameStatus !== "GAME_PLAYING") {
        return;
      }
      let foundSpot = false;
      for (let y = yGridMax; y >= 0; y--) {
        if (gameMatrix[y][activeColumn] === 0 && foundSpot === false) {
          const gm = [...gameMatrix];
          gm[y][activeColumn] = currentPlayer;
          // console.log(gm);
          setGameMatrix(gm);
          foundSpot = true;
          console.log({ x: activeColumn, y: y });
          setLastMove({ x: activeColumn, y: y });
          setActiveColumn(null); // for mobile
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

      const winningResult = checkWin({ lastMove, gameMatrix, currentPlayer });

      if (winningResult) {
        console.log("winningResult", winningResult);
        setWinner(winningResult.winner);
        setWinningCoords(winningResult.matches);
      }

      switchPlayer();
    };
    const switchPlayer = () => {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    };

    checkWinner();
  }, [lastMove]);

  useEffect(() => {
    if (winner !== null) {
      console.log("Player " + winner + " wins!!!");
      setGameStatus("GAME_WIN");
    }
  }, [winner]);

  useEffect(() => {
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

    document.addEventListener("mouseover", _throttle(dragToken, 50));
    return () =>
      document.removeEventListener("mouseover", _throttle(dragToken, 50));
  });

  return (
    <div className="GameGrid">
      <div className="GameGrid-Message">
        {gameStatus} {winner}
      </div>
      <table id="GameGridTable" ref={tableRef} className="GameGrid-Table">
        <thead>
          <tr id="GameGridTableHeader">
            {gameMatrix[0].map((x, y) => {
              const headerClasses = classNames({
                [`header${y}`]: true,
                active: y === activeColumn,
                [`player${currentPlayer}`]: true,
              });
              return (
                <td key={`thead${y}`} className={headerClasses}>
                  <span></span>
                </td>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {gameMatrix.map((row, y) => {
            return (
              <tr key={`col${y}`}>
                {row.map((v, x) => {
                  const tdClasses = classNames({
                    highlight: x === activeColumn,
                    [`player${v}`]: true,
                    [`header${y}`]: true,
                    winningCoord: isWinningCoord({ cx: x, cy: y }),
                  });
                  return (
                    <td className={tdClasses} key={`slot_${x}_${y}`}>
                      <span>{`${x}_${y}`}</span>
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
