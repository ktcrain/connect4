import React, { useContext, useState, useCallback, useEffect } from "react";
import useGridCoords from "./useGridCoords";
import getInitialGameMatrix from "./getInitialGameMatrix";
import checkWin from "../../../util/checkWin";
import findMoveCoords from "../../../util/findMoveCoords";
import { CSSRulePlugin } from "gsap/CSSRulePlugin";
import { gsap, TimelineLite, Bounce } from "gsap";

gsap.registerPlugin(CSSRulePlugin);

const BoardContext = React.createContext();
export default BoardContext;

const BoardContextProvider = (props) => {
  const [gameStatus, setGameStatus] = useState("PLAYING");
  const { headerCoords, gameMatrixCoords } = useGridCoords();
  const [locked, setLocked] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
  const [gameMatrix, setGameMatrix] = useState(getInitialGameMatrix());
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [lastMove, setLastMove] = useState(null);
  const [winner, setWinner] = useState(null);
  const [winningCoords, setWinningCoords] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleReset = () => {
    setGameMatrix(getInitialGameMatrix());
    setLastMove(null);
    setLocked(false);
    setWinner(null);
    setWinningCoords([]);
    setGameStatus("PLAYING");
  };

  const checkActiveColumn = useCallback(
    (e) => {
      const mouseCoords = {
        x: e.clientX,
        y: e.clientY,
      };

      headerCoords.forEach((bound, i) => {
        if (bound.l <= mouseCoords.x && bound.r >= mouseCoords.x) {
          if (activeColumn !== i) {
            setActiveColumn(i);
          }
        }
      });
    },
    [activeColumn, headerCoords]
  );

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [loading]);

  useEffect(() => {
    const lockMove = (e) => {
      if (locked) return;
      checkActiveColumn(e);
      setGameStatus("GAME_HANDLE_MOVE");
      setLocked(true);
    };
    document.addEventListener("mousedown", lockMove);
    return () => {
      document.removeEventListener("mousedown", lockMove);
    };
  }, [locked, checkActiveColumn]);

  useEffect(() => {
    const dragToken = (e) => {
      if (locked) return;
      checkActiveColumn(e);
    };
    document.addEventListener("mousemove", dragToken);
    return () => document.removeEventListener("mousemove", dragToken);
  }, [checkActiveColumn, locked]);

  useEffect(() => {
    const handleMove = () => {
      const moveCoords = findMoveCoords({ x: activeColumn, gameMatrix });

      if (moveCoords) {
        const { x, y } = moveCoords;
        const onAfterAnimate = () => {
          setLastMove({ x, y });
          setGameMatrix((gm) => {
            gm[y][x] = currentPlayer;
            return gm;
          });
          setActiveColumn(null); // for mobile
          setGameStatus("CHECK_WINNER");
        };

        const token = CSSRulePlugin.getRule(
          `.GameGrid-Table thead td.header.active span:after`
        );

        const topPos = gameMatrixCoords[y][x].y - headerCoords[y].y;
        const tl = new TimelineLite({ onComplete: onAfterAnimate });
        tl.to(token, 1, {
          top: topPos + "px",
          ease: Bounce.easeOut,
        }).set(token, {
          top: 0,
        });
      }
    };
    if (gameStatus === "GAME_HANDLE_MOVE") handleMove();
  }, [
    gameStatus,
    setGameStatus,
    gameMatrixCoords,
    activeColumn,
    setActiveColumn,
    currentPlayer,
    gameMatrix,
    headerCoords,
  ]);

  useEffect(() => {
    const checkWinner = () => {
      const winningResult = checkWin({ lastMove, gameMatrix, currentPlayer });

      if (winningResult) {
        setWinner(winningResult.winner);
        setGameStatus("GAME_WIN");
        setWinningCoords(winningResult.matches);
      } else {
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
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
        setGameStatus,
        headerCoords,
        gameMatrixCoords,
        locked,
        setLocked,
        activeColumn,
        setActiveColumn,
        gameMatrix,
        setGameMatrix,
        currentPlayer,
        setCurrentPlayer,
        lastMove,
        setLastMove,
        winner,
        setWinner,
        winningCoords,
        setWinningCoords,
        loading,
        setLoading,
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
