import React, { useContext, useState, useEffect, useRef } from "react";
import useGridCoords from "./useGridCoords";
import getInitialGameMatrix from "./getInitialGameMatrix";
import checkWin from "../../../util/checkWin";
import findMoveCoords from "../../../util/findMoveCoords";
import checkActiveColumn from "../../../util/checkActiveColumn";
import { CSSRulePlugin } from "gsap/CSSRulePlugin";
import { gsap, TimelineLite, Bounce } from "gsap";

gsap.registerPlugin(CSSRulePlugin);

const BoardContext = React.createContext();
export default BoardContext;

const BoardContextProvider = (props) => {
  const gameGridRef = useRef();

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

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [loading]);

  useEffect(() => {
    const gameGrid = gameGridRef.current;

    const lockMove = (e) => {
      if (locked) return;
      checkActiveColumn({ e, activeColumn, headerCoords, setActiveColumn });
      setGameStatus("GAME_HANDLE_MOVE");
      setLocked(true);
    };
    gameGrid.addEventListener("mousedown", lockMove);
    return () => {
      gameGrid.removeEventListener("mousedown", lockMove);
    };
  }, [locked, activeColumn, headerCoords]);

  useEffect(() => {
    const gameGrid = gameGridRef.current;
    const dragToken = (e) => {
      if (locked) return;
      checkActiveColumn({ e, activeColumn, headerCoords, setActiveColumn });
    };
    gameGrid.addEventListener("mousemove", dragToken);
    return () => gameGrid.removeEventListener("mousemove", dragToken);
  }, [locked, activeColumn, headerCoords]);

  useEffect(() => {
    const animateMove = ({ x, y, onComplete, top }) => {
      const token = CSSRulePlugin.getRule(
        `.GameGrid-Table thead td.header.active span:after`
      );

      const tl = new TimelineLite({ onComplete });
      tl.to(token, 1, {
        top: top + "px",
        ease: Bounce.easeOut,
      }).set(token, {
        top: 0,
      });
    };

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
        const top = gameMatrixCoords[y][x].y - headerCoords[y].y;
        animateMove({ x, y, top, onComplete: onAfterAnimate });
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
