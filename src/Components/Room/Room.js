import React, { useContext } from "react";
import "./Room.scss";
// import GameGrid from "../GameGrid";
import BoardContext from "./hooks/context";
import GameGridTable from "../GameGridTable";
import { motion } from "framer-motion";
import CopyToClipBoardButton from "../CopyToClipBoardButton";
// import PageLoader from "../PageLoader";

function Room() {
  const {
    currentPlayer,
    gameGridRef,
    playerId,
    roomId,
    connected,
    handleReset,
    winner,
    loading,
  } = useContext(BoardContext);

  const ResetButton = ({ children }) => {
    return <button onClick={handleReset}>{children}</button>;
  };

  const roomUrl = `${window.location.origin}/room/${roomId}`;

  return (
    <>
      {connected && loading && (
        <motion.div
          initial={{ opacity: 0, height: "0" }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: "0" }}
          transition={{
            default: { duration: 1, type: "spring", stiffness: 60 },
          }}
          className="Room-Connected"
        >
          <div className="Inner">
            <h2>Connected! Lets Play!</h2>
          </div>
        </motion.div>
      )}
      {!connected && playerId === 1 && (
        <motion.div
          initial={{ opacity: 0, height: "0" }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: "0" }}
          transition={{
            default: { duration: 1, type: "spring", stiffness: 60 },
          }}
          className="Room-Lobby"
        >
          <div className="Inner">
            <h2>Invite Your Friend</h2>
            <CopyToClipBoardButton>{roomUrl}</CopyToClipBoardButton>
          </div>
        </motion.div>
      )}
      {winner && (
        <motion.div
          initial={{ opacity: 0, height: "0" }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: "0" }}
          transition={{
            default: { duration: 1, type: "spring", stiffness: 60 },
          }}
          className="Room-Winner"
        >
          <h1>{playerId === winner ? `You Won!` : `You Lost!`}</h1>
          <ResetButton>Play Again</ResetButton>
        </motion.div>
      )}
      {!loading && (
        <div className="Room-Message">
          {!winner && currentPlayer && currentPlayer === playerId && (
            <h2>Your Turn</h2>
          )}
          {!winner && currentPlayer && currentPlayer !== playerId && (
            <h2>Waiting on Player #{currentPlayer}</h2>
          )}
        </div>
      )}
      <div className="GameGrid" ref={gameGridRef} key="GameGrid">
        {!loading && (
          <motion.div
            initial={{ opacity: 0, height: "0" }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: "0" }}
            transition={{
              default: { duration: 1, type: "spring", stiffness: 60 },
            }}
            className="Room-Board"
          >
            <GameGridTable context={BoardContext} />
            <div className="Room-Reset">
              <ResetButton>Reset</ResetButton>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}

export default Room;
