import React from "react";
import "./GameGrid.scss";
import BoardContext, { useBoardContext } from "./hooks";
import { motion, AnimatePresence } from "framer-motion";
import PageLoader from "../PageLoader";
import GameGridTable from "../GameGridTable";

function GameGrid() {
  const { winner, handleReset, loading, gameGridRef } = useBoardContext();
  return (
    <AnimatePresence exitBeforeEnter>
      <div className="GameGrid-Wrapper">
        <div className="GameGrid" ref={gameGridRef}>
          {winner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, top: "-300px" }}
              transition={{
                height: { type: "spring", stiffness: 100 },
                default: { duration: 1 },
              }}
              className="GameGrid-Winner"
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
            <GameGridTable display={true} context={BoardContext} />
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default GameGrid;
