import React, { useContext, useState, useEffect, useRef } from "react";
import useGridCoords from "./useGridCoords";
import useBoard from "./useBoard";
import checkWin from "../../../util/checkWin";
import findMoveCoords from "../../../util/findMoveCoords";
import checkActiveColumn from "../../../util/checkActiveColumn";
import animateMove from "../../../shared/animateMove";

const BoardContext = React.createContext();
export default BoardContext;

const BoardContextProvider = (props) => {
  const gameGridRef = useRef();

  const { headerCoords, gameMatrixCoords } = useGridCoords();
  const [loading, setLoading] = useState(true);

  const { boardState, dispatch } = useBoard();
  const {
    locked,
    activeColumn,
    currentColumn,
    lastMove,
    gameStatus,
    gameMatrix,
    currentPlayer,
    winner,
    winningCoords,
  } = boardState;

  const handleReset = () => {
    dispatch({ type: "RESET" });
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [loading]);

  useEffect(() => {
    const gameGrid = gameGridRef.current;

    const lockMove = (e) => {
      if (locked) return;
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
    return () => {
      gameGrid.removeEventListener("mousedown", lockMove);
    };
  }, [locked, activeColumn, headerCoords, dispatch]);

  useEffect(() => {
    const gameGrid = gameGridRef.current;
    const dragToken = (e) => {
      if (locked) return;
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
  }, [locked, activeColumn, headerCoords, dispatch]);

  useEffect(() => {
    const handleMove = () => {
      const move = findMoveCoords({ x: activeColumn, gameMatrix });
      const { x, y } = move;
      const onAfterAnimate = () => {
        dispatch({
          type: "HANDLE_MOVE",
          payload: { move: { x, y }, playerId: currentPlayer },
        });
      };
      const top = gameMatrixCoords[y][x].y - headerCoords[y].y;
      animateMove({ x, y, top, onComplete: onAfterAnimate });
    };
    if (gameStatus === "HANDLE_MOVE") handleMove();
  }, [
    gameStatus,
    dispatch,
    gameMatrixCoords,
    activeColumn,
    currentPlayer,
    gameMatrix,
    headerCoords,
    lastMove,
  ]);

  useEffect(() => {
    const checkWinner = () => {
      const result = checkWin({ lastMove, gameMatrix, currentPlayer });
      if (result) {
        dispatch({
          type: "HANDLE_WINNER",
          payload: { result },
        });
      } else {
        dispatch({
          type: "SWITCH_PLAYER",
          payload: { playerId: currentPlayer === 1 ? 2 : 1 },
        });
      }
    };
    if (gameStatus === "CHECK_WINNER") checkWinner();
  }, [gameStatus, currentPlayer, gameMatrix, lastMove, winner, dispatch]);

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
