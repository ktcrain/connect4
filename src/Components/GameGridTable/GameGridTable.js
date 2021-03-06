import React, { useContext } from "react";
import { isWinningCoord } from "../../util/checkWin";
// import { useBoardContext } from "../GameGrid/hooks";
import "./GameGridTable.scss";
const classNames = require("classnames");

function GameGridTable({ display, context }) {
  const {
    activeColumn,
    gameMatrix,
    currentPlayer,
    winningCoords,
    loading,
    locked,
    currentColumn,
    gameGridRef,
  } = useContext(context);

  const tableClasses = classNames({
    "GameGrid-Table": true,
    loading: loading,
    locked: locked,
    display: display,
  });

  return (
    <table ref={gameGridRef} className={tableClasses}>
      <thead>
        <tr id="GameGridTableHeader">
          {gameMatrix[0].map((x, y) => {
            const headerClasses = classNames({
              header: true,
              [`header${y}`]: true,
              active: y === activeColumn,
              current: y === currentColumn,
              [`player${currentPlayer}`]: true,
            });
            return (
              <td key={`thead${y}`} className={headerClasses}>
                <span> </span>
              </td>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {gameMatrix.map((row, y) => {
          return (
            <tr key={`col${y}`}>
              {row.map((v, x) => {
                const tdClasses = classNames({
                  [`cell_${x}_${y}`]: true,
                  highlight: x === activeColumn,
                  [`player${v}`]: true,
                  [`header${y}`]: true,
                  winningCoord: isWinningCoord({
                    cx: x,
                    cy: y,
                    winningCoords,
                  }),
                });
                return (
                  <td className={tdClasses} key={`cell_${x}_${y}`}>
                    <span></span>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default GameGridTable;
