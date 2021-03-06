import React, { useContext, useState, useEffect } from "react";
// import useGridCoords from "../../../shared/hooks/useGridCoords";
import checkWin from "../../../util/checkWin";
import findMoveCoords from "../../../util/findMoveCoords";
import checkActiveColumn from "../../../util/checkActiveColumn";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import useBoard from "../../GameGrid/hooks/useBoard";

const generateRoomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const BoardContext = React.createContext();
export default BoardContext;

const BoardContextProvider = (props) => {
  const {
    boardState,
    dispatch,
    gameGridRef,
    headerCoords,
    gameMatrixCoords,
  } = useBoard();
  const {
    locked,
    activeColumn,
    currentColumn,
    lastMove,
    currentMove,
    gameStatus,
    gameMatrix,
    currentPlayer,
    winner,
    winningCoords,
    playerId,
  } = boardState;

  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [connected, setConnected] = useState(null);

  let { slug } = useParams();

  useEffect(() => {
    if (socket === null) {
      console.log("Initializing websocket");
      const host = window.location.host;
      const domain = host.split(":")[0];
      console.log(domain);
      const protocol = window.location.protocol === "http:" ? "ws" : "wss";
      const port = window.location.protocol === "http:" ? "8080" : "443";
      const wsString = `${protocol}://${domain}:${port}`;
      console.log("wsString", wsString);
      const socket = io(wsString);
      setSocket(socket);

      socket.on("roomJoined", ({ playerId }) => {
        console.log("roomJoined", playerId);
        if (playerId === 2) {
          setConnected(true);
        }
      });

      socket.on("move", ({ move, playerId }) => {
        console.log("received move from server", move);
        dispatch({
          type: "HANDLE_CURRENT_MOVE",
          payload: { move, playerId },
        });
      });

      socket.on("winningResult", (result) => {
        console.log("received winner from server", result);
        dispatch({
          type: "HANDLE_WINNER",
          payload: { result },
        });
      });

      socket.on("reset", (props) => {
        console.log("received reset from server", props);
        dispatch({ type: "RESET" });
      });
    }
  }, [roomId, socket, gameMatrix, connected, dispatch]);

  useEffect(() => {
    if (socket === null) return;
    if (roomId !== null) return;
    const lsRoomId = localStorage.getItem("roomId");
    console.log("useEffect roomSetup");
    if (slug !== undefined) {
      console.log("setting room id from route", slug);
      setRoomId(slug);
      dispatch({ type: "SET_PLAYER_ID", payload: { playerId: 2 } });
      socket.emit("joinRoom", { roomId: slug, playerId: 2 });
    } else if (lsRoomId !== null) {
      console.log("setting roomId from local storage", lsRoomId);
      dispatch({ type: "SET_PLAYER_ID", payload: { playerId: 1 } });
      setRoomId(lsRoomId);
      socket.emit("joinRoom", { roomId: lsRoomId, playerId: 1 });
    } else {
      dispatch({ type: "SET_PLAYER_ID", payload: { playerId: 1 } });
      const newRoomId = generateRoomId();
      localStorage.setItem("roomId", newRoomId);
      console.log("creating new roomId", newRoomId);
      socket.emit("joinRoom", { roomId: newRoomId, playerId: 1 });
      setRoomId(newRoomId);
    }
  }, [slug, socket, roomId, connected]);

  useEffect(() => {
    console.log("connected", connected);
    // [TODO] sync game matrix between players
  }, [connected]);

  // [TODO] handleReset via socket
  const handleReset = () => {
    console.log("sending reset to server");
    socket.emit("handleReset", { roomId });
  };

  useEffect(() => {
    if (connected === true) {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    } else {
      setLoading(true);
    }
  }, [connected]);

  useEffect(() => {
    const handleCurrentMove = () => {
      const move = findMoveCoords({ x: activeColumn, gameMatrix });
      console.log("sending move to server");
      socket.emit("move", {
        pid: playerId,
        roomId,
        move,
      });
    };
    if (gameStatus === "HANDLE_CURRENT_MOVE") handleCurrentMove();
  }, [
    gameStatus,
    activeColumn,
    gameMatrix,
    lastMove,
    playerId,
    roomId,
    socket,
  ]);

  useEffect(() => {
    const checkWinner = () => {
      const result = checkWin({ lastMove, gameMatrix, currentPlayer });

      if (result !== null) {
        console.log("sending winner to server", result);
        socket.emit("setWinningResult", {
          roomId,
          result,
        });
      } else {
        dispatch({
          type: "SWITCH_PLAYER",
          payload: { playerId: currentPlayer === 1 ? 2 : 1 },
        });
      }
    };

    if (gameStatus === "CHECK_WINNER") checkWinner();
  }, [
    gameStatus,
    currentPlayer,
    gameMatrix,
    lastMove,
    winner,
    roomId,
    socket,
    dispatch,
  ]);

  return (
    <BoardContext.Provider
      value={{
        handleReset,
        gameStatus,
        headerCoords,
        gameMatrixCoords,
        locked,
        activeColumn,
        gameMatrix,
        currentPlayer,
        lastMove,
        winner,
        winningCoords,
        loading,
        gameGridRef,
        playerId,
        roomId,
        connected,
        currentMove,
        currentColumn,
      }}
    >
      {props.children}
    </BoardContext.Provider>
  );
};

function useBoardContext() {
  return useContext(BoardContext);
}

export { BoardContextProvider, useBoardContext };
