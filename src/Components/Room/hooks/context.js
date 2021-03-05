import React, { useContext, useState, useEffect, useRef } from "react";
import useGridCoords from "./useGridCoords";
import getInitialGameMatrix from "./getInitialGameMatrix";
import getInitialPlayer from "./getInitialPlayer";
import checkWin from "../../../util/checkWin";
import findMoveCoords from "../../../util/findMoveCoords";
import checkActiveColumn from "../../../util/checkActiveColumn";
import { CSSRulePlugin } from "gsap/CSSRulePlugin";
import { gsap, TimelineLite, Bounce } from "gsap";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const generateRoomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

gsap.registerPlugin(CSSRulePlugin);

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
  const [currentPlayer, setCurrentPlayer] = useState(() => getInitialPlayer());
  // const [currentPlayer, setCurrentPlayer] = useState(1);
  const [currentMove, setCurrentMove] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [winner, setWinner] = useState(null);
  const [winningCoords, setWinningCoords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [connected, setConnected] = useState(null);

  const lsRoomId = localStorage.getItem("roomId");

  let { slug } = useParams();

  useEffect(() => {
    if (socket === null) {
      const daSocket = io("ws://localhost:6455");
      setSocket(daSocket);

      // sync game matrix between players
      daSocket.emit("setGameMatrix", { roomId, gameMatrix });

      daSocket.on("move", ({ move }) => {
        console.log("received move from server", move);
        setCurrentColumn(move.x);
        setCurrentMove(move);
      });

      daSocket.on("gameMatrix", (props) => {
        console.log("gameMatrix", props.gameMatrix);
        setGameMatrix(props.gameMatrix);
        localStorage.setItem("gameMatrix", JSON.stringify(props.gameMatrix));
      });

      daSocket.on("gameMatrix", ({ gameMatrix }) => {
        console.log("gameMatrix", gameMatrix);
        setGameMatrix(gameMatrix);
        localStorage.setItem("gameMatrix", JSON.stringify(gameMatrix));
      });

      daSocket.on("friendJoined", () => {
        setConnected(true);
      });
    }
  }, [roomId, socket]);

  useEffect(() => {
    console.log('setGameStatus("GAME_HANDLE_MOVE");');
    setGameStatus("GAME_HANDLE_MOVE");
  }, [currentMove]);

  useEffect(() => {
    if (socket === null) return;
    if (roomId !== null) return;
    console.log("useEffect roomSetup");
    if (slug !== undefined) {
      console.log("setting room id from route", slug);
      setRoomId(slug);
      setPlayerId(2);
      socket.emit("joinRoom", { roomId: slug });
    } else if (lsRoomId !== null) {
      console.log("setting roomId from local storage", lsRoomId);
      setPlayerId(1);
      setRoomId(lsRoomId);
      socket.emit("joinRoom", { roomId: lsRoomId });
    } else {
      setPlayerId(1);
      const newRoomId = generateRoomId();
      localStorage.setItem("roomId", newRoomId);
      console.log("creating new roomId", newRoomId);
      socket.emit("joinRoom", { roomId: newRoomId });
      setRoomId(newRoomId);
    }
  }, [slug, socket, roomId]);

  useEffect(() => {
    console.log("connected", connected);
  }, [connected]);

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

  useEffect(() => {
    const gameGrid = gameGridRef.current;
    const dragToken = (e) => {
      if (locked) return;
      if (playerId !== currentPlayer) {
        console.log("Player " + playerId + " is not " + currentPlayer);
        return;
      }
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
      setGameStatus("GAME_HANDLE_CURRENT_MOVE");
      setLocked(true);
    };

    gameGrid.addEventListener("mousedown", lockMove);
    return () => {
      gameGrid.removeEventListener("mousedown", lockMove);
    };
  });

  useEffect(() => {
    if (gameStatus === "GAME_HANDLE_CURRENT_MOVE") {
      const move = findMoveCoords({ x: activeColumn, gameMatrix });
      console.log("GAME_HANDLE_CURRENT_MOVE", move, lastMove);
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
  }, [gameStatus]);

  useEffect(() => {
    const handleMove = ({ move }) => {
      console.log("handleMove playerId", move, playerId);
      const animateMove = ({ x, y, onComplete, top }) => {
        const token = CSSRulePlugin.getRule(
          `.GameGrid-Table thead td.header.current span:after`
        );
        const tl = new TimelineLite({ onComplete });
        tl.to(token, 1, {
          top: top + "px",
          ease: Bounce.easeOut,
        }).set(token, {
          top: 0,
        });
      };

      if (move) {
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
    if (gameStatus === "GAME_HANDLE_MOVE") {
      handleMove({ move: currentMove });
    }
  }, [gameStatus, currentMove]);

  useEffect(() => {
    const checkWinner = () => {
      const winningResult = checkWin({ lastMove, gameMatrix, currentPlayer });

      if (winningResult) {
        setWinner(winningResult.winner);
        setGameStatus("GAME_WIN");
        setWinningCoords(winningResult.matches);
      } else {
        setCurrentPlayer((cp) => {
          cp = cp === 1 ? 2 : 1;
          localStorage.setItem("currentPlayer", cp);
          // socket.emit("setCurrentPlayer", {
          //   roomId,
          //   currentPlayer: cp,
          // });
          console.log("post win check setCurrentPlayer", cp);
          return cp;
        });
        setGameStatus("PLAYING");
        setLocked(false);
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
