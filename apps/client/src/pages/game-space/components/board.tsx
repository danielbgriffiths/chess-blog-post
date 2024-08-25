import { Fragment, memo } from "react";

import { BoardOverlay } from "./board-overlay";
import { Cell } from "./cell";
import { GameStatus, useGameState } from "../../../hooks/use-game-state";
import { useBoard } from "../../../context/board/use-context";

export const Board = memo(function Component() {
  const board = useBoard();
  const gameState = useGameState();

  return (
    <div
      className={`relative flex justify-center items-center w-full h-full bg-gray-100 shadow-lg shadow-gray-200 ${gameState.status !== GameStatus.InProgress ? "overflow-y-hidden" : "overflow-y-scroll"}`}
    >
      <BoardOverlay />
      <div className="grid grid-cols-8 gap-1 p-2 max-w-[900px] max-h-[900px] mt-4 bg-white shadow-md shadow-gray-200">
        {board.board.map((row, i) => {
          return (
            <Fragment key={i}>
              {row.map((_cell, j) => {
                return (
                  <Cell
                    key={i + j}
                    uid={`${i}-${j}`}
                    bgClass={(i + j) % 2 === 0 ? "bg-white" : "bg-slate-100"}
                  />
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
});
