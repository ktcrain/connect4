import React, { useContext, useState, useEffect } from "react";
import useBoard from "./useBoard";
import checkWin from "../../../util/checkWin";
import findMoveCoords from "../../../util/findMoveCoords";

const BoardContext = React.createContext();
export default BoardContext;

const BoardContextProvider = (props) => {
  const [loading, setLoading] = useState(true);

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
    const handleCurrentMove = () => {
      const move = findMoveCoords({ x: activeColumn, gameMatrix });
      if (!move) {
        console.trace(activeColumn, gameMatrix);
      }
      dispatch({
        type: "HANDLE_CURRENT_MOVE",
        payload: { move, playerId: currentPlayer },
      });
    };
    if (gameStatus === "HANDLE_CURRENT_MOVE") handleCurrentMove();
  }, [
    gameStatus,
    dispatch,
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
