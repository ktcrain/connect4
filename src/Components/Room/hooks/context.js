import React, { useContext, useState, useEffect, useRef } from "react";
import useGridCoords from "../../../shared/hooks/useGridCoords";
import getInitialGameMatrix from "../../../shared/getInitialGameMatrix";
import animateMove from "../../../shared/animateMove";
// import getInitialPlayer from "./getInitialPlayer";
import checkWin from "../../../util/checkWin";
import findMoveCoords from "../../../util/findMoveCoords";
import checkActiveColumn from "../../../util/checkActiveColumn";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const generateRoomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const BoardContext = React.createContext();
export default BoardContext;

const BoardContextProvider = (props) => {
  const gameGridRef = useRef();
  const [gameStatus, setGameStatus] = useState("PLAYING");
  const { headerCoords, gameMatrixCoords } = useGridCoords();
  const [locked, setLocked] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
  const [currentColumn, setCurrentColumn] = useState(null);
  const [gameMatrix, setGameMatrix] = useState(() => getInitialGameMatrix());
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [currentMove, setCurrentMove] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [winner, setWinner] = useState(null);
  const [winningCoords, setWinningCoords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [connected, setConnected] = useState(null);

  let { slug } = useParams();

  const updateCurrentPlayer = (playerId) => {
    setCurrentPlayer(playerId);
    localStorage.setItem("currentPlayer", playerId);
  };

  useEffect(() => {
    if (socket === null) {
      console.log("Initializing websocket");
      const host = window.location.host;
      const domain = host.split(":")[0];
      const wsString = `ws://${domain}:6455`;
      console.log("wsString", wsString);
      const socket = io(wsString);
      setSocket(socket);

      socket.on("roomJoined", ({ playerId }) => {
        console.log("roomJoined", playerId);
        if (playerId === 2) {
          setConnected(true);
        }
      });

      socket.on("move", ({ move }) => {
        console.log("received move from server", move);
        setCurrentColumn(move.x);
        setCurrentMove(move);
      });

      socket.on("gameMatrix", (props) => {
        console.log("gameMatrix", props.gameMatrix);
        setGameMatrix(props.gameMatrix);
        localStorage.setItem("gameMatrix", JSON.stringify(props.gameMatrix));
      });

      socket.on("winningResult", (props) => {
        console.log("received winner from server", props);
        setWinner(props.winner);
        setWinningCoords(props.matches);
        setGameStatus("HANDLE_WINNER");
      });

      socket.on("reset", (props) => {
        console.log("received reset from server", props);
        setGameMatrix(getInitialGameMatrix(true));
        updateCurrentPlayer(1);
        setLastMove(null);
        setLocked(false);
        setWinner(null);
        setWinningCoords([]);
        setGameStatus("PLAYING");
      });
    }
    // return () => {
    //   if (socket !== null) {
    //     socket.off("move");
    //     socket.off("gameMatrix");
    //     socket.off("winningResult");
    //     socket.off("friendJoined");
    //   }
    // };
  }, [roomId, socket, gameMatrix, connected]);

  useEffect(() => {
    console.log('setGameStatus("HANDLE_MOVE");');
    setGameStatus("HANDLE_MOVE");
  }, [currentMove]);

  useEffect(() => {
    if (socket === null) return;
    if (roomId !== null) return;
    const lsRoomId = localStorage.getItem("roomId");
    console.log("useEffect roomSetup");
    if (slug !== undefined) {
      console.log("setting room id from route", slug);
      setRoomId(slug);
      setPlayerId(2);
      socket.emit("joinRoom", { roomId: slug, playerId: 2 });
    } else if (lsRoomId !== null) {
      console.log("setting roomId from local storage", lsRoomId);
      setPlayerId(1);
      setRoomId(lsRoomId);
      socket.emit("joinRoom", { roomId: lsRoomId, playerId: 1 });
    } else {
      setPlayerId(1);
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
    const gameGrid = gameGridRef.current;
    const dragToken = (e) => {
      if (locked) return;
      if (playerId !== currentPlayer) return;
      checkActiveColumn({ e, activeColumn, headerCoords, setActiveColumn });
    };
    gameGrid.addEventListener("mousemove", dragToken);
    return () => gameGrid.removeEventListener("mousemove", dragToken);
  }, [locked, activeColumn, headerCoords, playerId, currentPlayer]);

  useEffect(() => {
    const gameGrid = gameGridRef.current;
    const lockMove = (e) => {
      if (locked) return;
      if (playerId !== currentPlayer) {
        console.log("Player " + playerId + " is not " + currentPlayer);
        return;
      }
      checkActiveColumn({ e, activeColumn, headerCoords, setActiveColumn });
      setGameStatus("HANDLE_CURRENT_MOVE");
      setLocked(true);
    };

    gameGrid.addEventListener("mousedown", lockMove);
    gameGrid.addEventListener("touchend", lockMove);
    return () => {
      gameGrid.removeEventListener("mousedown", lockMove);
      gameGrid.removeEventListener("touchend", lockMove);
    };
  });
  useEffect(() => {
    console.log('setGameStatus("HANDLE_MOVE");');
    setGameStatus("HANDLE_MOVE");
  }, [currentMove]);
  useEffect(() => {
    if (gameStatus === "HANDLE_CURRENT_MOVE") {
      const move = findMoveCoords({ x: activeColumn, gameMatrix });
      console.log("HANDLE_CURRENT_MOVE", move, lastMove);
      const duplicate = move.x === lastMove?.x && move.y === lastMove?.y;
      if (lastMove === null || !duplicate) {
        console.log("sending move to server", move);
        socket.emit("move", {
          pid: playerId,
          roomId,
          move,
        });
      } else {
        console.log("duplicate", duplicate);
      }
    }
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
    const handleMove = ({ move }) => {
      if (move) {
        console.log("handleMove playerId", move, playerId);
        const { x, y } = move;
        const onAfterAnimate = () => {
          setGameMatrix((gm) => {
            gm[y][x] = currentPlayer;
            localStorage.setItem("gameMatrix", JSON.stringify(gm));
            return gm;
          });
          setLastMove(move);
          setActiveColumn(null); // for mobile
          setCurrentColumn(null); // for mobile
          setGameStatus("CHECK_WINNER");
        };
        const top = gameMatrixCoords[y][x].y - headerCoords[y].y;
        animateMove({ x, y, top, onComplete: onAfterAnimate });
      }
    };
    if (gameStatus === "HANDLE_MOVE") {
      handleMove({ move: currentMove });
    }
  }, [
    gameStatus,
    currentMove,
    currentPlayer,
    gameMatrixCoords,
    headerCoords,
    playerId,
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
        const newPlayerId = currentPlayer === 1 ? 2 : 1;
        updateCurrentPlayer(newPlayerId);
        setGameStatus("PLAYING");
        setLocked(false);
        console.log("post win check setCurrentPlayer", newPlayerId);
      }
    };

    if (gameStatus === "CHECK_WINNER") checkWinner();
  }, [
    gameStatus,
    currentPlayer,
    gameMatrix,
    lastMove,
    winner,
    setGameStatus,
    setLocked,
    roomId,
    socket,
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
