import { useReducer, useEffect, useRef } from "react";
import getInitialGameMatrix from "./getInitialGameMatrix";
import useGridCoords from "../../../shared/hooks/useGridCoords";
import checkActiveColumn from "../../../util/checkActiveColumn";
import animateMove from "../../../shared/animateMove";

function useBoard() {
  const { headerCoords, gameMatrixCoords } = useGridCoords();
  const gameGridRef = useRef();

  const getInitialState = () => {
    const initialState = {
      locked: false,
      gameStatus: "PLAYING",
      activeColumn: null,
      currentColumn: null,
      lastMove: null,
      currentMove: null,
      currentPlayer: 1,
      gameMatrix: getInitialGameMatrix(),
      winner: null,
      winningCoords: [],
    };
    return initialState;
  };

  useEffect(() => {
    const gameGrid = gameGridRef.current;
    const { locked, activeColumn, playerId, currentPlayer } = boardState;
    const dragToken = (e) => {
      if (locked) return;
      if (playerId !== null && playerId !== currentPlayer) {
        console.log("Player " + playerId + " is not " + currentPlayer);
        return;
      }
      const newActiveColumn = checkActiveColumn({
        e,
        activeColumn,
        headerCoords,
      });
      if (newActiveColumn !== activeColumn) {
        dispatch({
          type: "UPDATE_ACTIVE_COLUMN",
          payload: { activeColumn: newActiveColumn },
        });
      }
    };
    gameGrid.addEventListener("mousemove", dragToken);
    return () => gameGrid.removeEventListener("mousemove", dragToken);
  });

  useEffect(() => {
    const gameGrid = gameGridRef.current;
    const { locked, activeColumn, currentPlayer, playerId } = boardState;

    const lockMove = (e) => {
      if (locked) return;
      if (playerId !== null && playerId !== currentPlayer) {
        return;
      }
      const newActiveColumn = checkActiveColumn({
        e,
        activeColumn,
        headerCoords,
      });
      dispatch({
        type: "LOCK_MOVE",
        payload: { activeColumn: newActiveColumn },
      });
    };

    gameGrid.addEventListener("mousedown", lockMove);
    gameGrid.addEventListener("touchend", lockMove);
    return () => {
      gameGrid.removeEventListener("mousedown", lockMove);
      gameGrid.removeEventListener("touchend", lockMove);
    };
  });

  useEffect(() => {
    const { gameStatus, currentMove, currentPlayer } = boardState;

    const handleMove = ({ move }) => {
      const { x, y } = move;
      const onAfterAnimate = () => {
        dispatch({
          type: "HANDLE_MOVE",
          payload: { move, playerId: currentPlayer },
        });
      };
      const top = gameMatrixCoords[y][x].y - headerCoords[y].y;
      animateMove({ x, y, top, onComplete: onAfterAnimate });
    };
    if (gameStatus === "HANDLE_MOVE") handleMove({ move: currentMove });
  });

  function boardReducer(state, action) {
    const { type, payload } = action;

    switch (type) {
      case "RESET":
        const newState = getInitialState();
        state = Object.assign(state, newState);
        break;
      case "UPDATE_ACTIVE_COLUMN":
        state.activeColumn = payload.activeColumn;
        break;
      case "LOCK_MOVE":
        state.locked = true;
        state.activeColumn = payload.activeColumn;
        state.currentColumn = payload.activeColumn;
        state.gameStatus = "HANDLE_CURRENT_MOVE";
        break;
      case "HANDLE_CURRENT_MOVE":
        state.currentMove = payload.move;
        state.currentColumn = payload.move.x;
        state.gameStatus = "HANDLE_MOVE";
        break;
      case "HANDLE_MOVE":
        state.lastMove = payload.move;
        state.gameMatrix[payload.move.y][payload.move.x] = payload.playerId;
        state.activeColumn = null; // for mobile
        state.currentColumn = null; // for mobile
        state.gameStatus = "CHECK_WINNER";
        break;
      case "SWITCH_PLAYER":
        state.currentPlayer = payload.playerId;
        state.locked = false;
        state.gameStatus = "PLAYING";
        break;
      case "HANDLE_WINNER":
        state.winner = payload.result.winner;
        state.winningCoords = payload.result.matches;
        state.gameStatus = "GAME_WIN";
        break;
      case "SET_PLAYER_ID":
        state.playerId = payload.playerId;
        break;
      default:
        throw new Error("unexpected action type");
    }
    return { ...state };
  }

  const initialState = getInitialState();
  initialState.playerId = null;
  const [boardState, dispatch] = useReducer(boardReducer, initialState);
  return { boardState, dispatch, gameGridRef, headerCoords, gameMatrixCoords };
}

export default useBoard;
