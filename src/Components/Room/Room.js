import React, { useContext } from "react";
import "./Room.scss";
// import GameGrid from "../GameGrid";
import BoardContext from "./hooks/context";
import GameGridTable from "../GameGridTable";

function Room() {
  const {
    currentPlayer,
    gameGridRef,
    playerId,
    roomId,
    connected,
  } = useContext(BoardContext);

  return (
    <div>
      <p>
        you are player {playerId} and you are playing in room {roomId}
      </p>
      {!connected && (
        <p>
          Invite your friend:{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href={`/room/${roomId}`}
          >{`/room/${roomId}`}</a>
        </p>
      )}
      {connected && <p>Connected! Lets Play!</p>}
      {currentPlayer && <p>Turn: Player {currentPlayer}</p>}
      <div className="GameGrid" ref={gameGridRef}>
        <GameGridTable context={BoardContext} display={connected} />
      </div>
    </div>
  );
}

export default Room;
