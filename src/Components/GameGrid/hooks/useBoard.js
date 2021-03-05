import { useReducer } from "react";
import getInitialGameMatrix from "./getInitialGameMatrix";

function useBoard() {
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

  function boardReducer(state, action) {
    const { type, payload } = action;

    switch (type) {
      case "RESET":
        state = getInitialState();
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
      default:
        throw new Error("unexpected action type");
    }
    return { ...state };
  }

  const initialState = getInitialState();
  const [boardState, dispatch] = useReducer(boardReducer, initialState);
  return { boardState, dispatch };
}

export default useBoard;
