import React, { useEffect, useRef, useState, useCallback } from "react";
import "./GameGrid.scss";
// import _throttle from "lodash/throttle";
import { gsap, TimelineLite, Bounce } from "gsap";
import { CSSRulePlugin } from "gsap/CSSRulePlugin";
import checkWin from "../../util/checkWin";
import findMoveCoords from "../../util/findMoveCoords";
import getInitialGameMatrix from "./hooks/getInitialGameMatrix";
import { useGridCoords } from "./hooks";
import { motion, AnimatePresence } from "framer-motion";
import PageLoader from "../PageLoader";

const classNames = require("classnames");

gsap.registerPlugin(CSSRulePlugin);

const isWinningCoord = ({ cx, cy, winningCoords }) => {
  let isWin = false;
  winningCoords.forEach(({ x, y }) => {
    if (cx === x && cy === y) {
      isWin = true;
    }
  });
  return isWin;
};

function GameGrid() {
  const { headerCoords, gameMatrixCoords } = useGridCoords();

  const [loading, setLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState("PLAYING");
  const [gameMatrix, setGameMatrix] = useState(getInitialGameMatrix());
  const [activeColumn, setActiveColumn] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [lastMove, setLastMove] = useState(null);
  const [winner, setWinner] = useState(null);
  const [winningCoords, setWinningCoords] = useState([]);
  const [locked, setLocked] = useState(false);

  const handleReset = () => {
    setGameMatrix(getInitialGameMatrix());
    setLastMove(null);
    setLocked(false);
    setWinner(null);
    setWinningCoords([]);
    setGameStatus("PLAYING");
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [loading]);

  const checkActiveColumn = useCallback(
    (e) => {
      const mouseCoords = {
        x: e.clientX,
        y: e.clientY,
      };

      headerCoords.forEach((bound, i) => {
        if (bound.l <= mouseCoords.x && bound.r >= mouseCoords.x) {
          if (activeColumn !== i) {
            setActiveColumn(i);
          }
        }
      });
    },
    [activeColumn, headerCoords]
  );

  useEffect(() => {
    const lockMove = (e) => {
      if (locked) return;
      checkActiveColumn(e);
      setGameStatus("GAME_HANDLE_MOVE");
      setLocked(true);
    };
    document.addEventListener("mousedown", lockMove);
    return () => {
      document.removeEventListener("mousedown", lockMove);
    };
  }, [gameStatus, locked, checkActiveColumn]);

  useEffect(() => {
    const dragToken = (e) => {
      if (locked) return;
      checkActiveColumn(e);
    };
    document.addEventListener("mousemove", dragToken);
    return () => document.removeEventListener("mousemove", dragToken);
  });

  useEffect(() => {
    const handleMove = () => {
      const moveCoords = findMoveCoords({ x: activeColumn, gameMatrix });
      if (moveCoords) {
        const { x, y } = moveCoords;
        const onAfterAnimate = () => {
          setLastMove({ x, y });
          setGameMatrix((gm) => {
            gm[y][x] = currentPlayer;
            return gm;
          });
          setActiveColumn(null); // for mobile
          setGameStatus("CHECK_WINNER");
        };

        const token = CSSRulePlugin.getRule(
          `.GameGrid-Table thead td.header.active span:after`
        );

        const topPos = gameMatrixCoords[y][x].y - headerCoords[y].y;
        const tl = new TimelineLite({ onComplete: onAfterAnimate });
        tl.to(token, 1, {
          top: topPos + "px",
          ease: Bounce.easeOut,
        }).set(token, {
          top: 0,
        });
      }
    };
    if (gameStatus === "GAME_HANDLE_MOVE") handleMove();
  }, [
    gameStatus,
    gameMatrixCoords,
    activeColumn,
    currentPlayer,
    gameMatrix,
    headerCoords,
  ]);

  useEffect(() => {
    const checkWinner = () => {
      const winningResult = checkWin({ lastMove, gameMatrix, currentPlayer });

      if (winningResult) {
        setWinner(winningResult.winner);
        setGameStatus("GAME_WIN");
        setWinningCoords(winningResult.matches);
      } else {
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        setGameStatus("PLAYING");
        setLocked(false);
      }
    };

    if (gameStatus === "CHECK_WINNER") checkWinner();
  }, [gameStatus, currentPlayer, gameMatrix, lastMove, winner]);

  const tableClasses = classNames({
    "GameGrid-Table": true,
    locked: locked,
    loading: loading,
  });

  return (
    <AnimatePresence exitBeforeEnter>
      <div className="GameGrid">
        {winner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, top: "-300px" }}
            transition={{
              height: { type: "spring", stiffness: 100 },
              default: { duration: 1 },
            }}
            className="GameGrid-Message"
          >
            <h1>Player {winner} wins</h1>
            <button onClick={handleReset}>Play Again</button>{" "}
          </motion.div>
        )}
        {loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              default: { duration: 0.25 },
            }}
            className="GameGrid-Loading"
          >
            <PageLoader />
          </motion.div>
        )}
        <motion.div
          initial={{ top: "-200px", opacity: 0, height: 0 }}
          animate={{ top: 0, opacity: 1, height: "auto" }}
          exit={{ top: "-200px", opacity: 0, height: 0 }}
          transition={{
            delay: 2,
            default: { duration: 1 },
          }}
          className="GameGrid-Wrapper"
        >
          <table className={tableClasses}>
            <thead>
              <tr id="GameGridTableHeader">
                {gameMatrix[0].map((x, y) => {
                  const headerClasses = classNames({
                    header: true,
                    [`header${y}`]: true,
                    active: y === activeColumn,
                    [`player${currentPlayer}`]: true,
                  });
                  return (
                    <td key={`thead${y}`} className={headerClasses}>
                      <span> </span>
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
                        [`cell_${x}_${y}`]: true,
                        highlight: x === activeColumn,
                        [`player${v}`]: true,
                        [`header${y}`]: true,
                        winningCoord: isWinningCoord({
                          cx: x,
                          cy: y,
                          winningCoords,
                        }),
                      });
                      return (
                        <td className={tdClasses} key={`cell_${x}_${y}`}>
                          <span></span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default GameGrid;
