import React from "react";
import "./GameGrid.scss";
import { useBoardContext } from "./hooks";
import { motion, AnimatePresence } from "framer-motion";
import PageLoader from "../PageLoader";
import { isWinningCoord } from "../../util/checkWin";

const classNames = require("classnames");

function GameGrid() {
  const {
    activeColumn,
    gameMatrix,
    currentPlayer,
    winner,
    winningCoords,
    handleReset,
    loading,
  } = useBoardContext();

  const tableClasses = classNames({
    "GameGrid-Table": true,
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
