import { createRef, memo, useEffect } from "react";

import { prettyPiece } from "../../../utils";
import { useBoard } from "../../../context/board/use-context";
import { useGameState, Side } from "../../../hooks/use-game-state";
import { CellData } from "../../../context/board/provider";

export const Cell = memo(function Component({
  uid,
  bgClass,
}: {
  uid: string;
  bgClass: "bg-white" | string;
}) {
  const board = useBoard();
  const gameState = useGameState();

  const cellRef = createRef<HTMLDivElement>();

  useEffect(() => {
    const isHoveredForWatcher = (cell?: CellData) => {
      return cell?.isHovered && gameState.isWatcher;
    };

    const isHoveredBySelf = (cell?: CellData) => {
      return (
        cell?.isHovered &&
        gameState.isUsersTurn &&
        cell.player === gameState.turn
      );
    };

    const isHoveredByOpponent = (cell?: CellData) => {
      return (
        cell?.isHovered &&
        !gameState.isWatcher &&
        !gameState.isUsersTurn &&
        cell.player === gameState.turn
      );
    };

    const isSelectedForWatcher = (cell?: CellData) => {
      return cell?.isSelected && gameState.isWatcher;
    };

    const isSelectedBySelf = (cell?: CellData) => {
      return (
        cell?.isSelected &&
        gameState.isUsersTurn &&
        cell.player === gameState.turn
      );
    };

    const isSelectedByOpponent = (cell?: CellData) => {
      return (
        cell?.isSelected &&
        !gameState.isWatcher &&
        !gameState.isUsersTurn &&
        cell.player === gameState.turn
      );
    };

    const isValidCaptureMoveForWatcher = (cell?: CellData) => {
      return (
        cell?.isValidMove &&
        gameState.isWatcher &&
        [Side.White, Side.Black].includes((cell.player ?? "") as Side) &&
        cell.player !== gameState.turn
      );
    };

    const isValidCaptureMoveBySelf = (cell?: CellData) => {
      return (
        cell?.isValidMove &&
        !gameState.isWatcher &&
        [Side.White, Side.Black].includes((cell.player ?? "") as Side) &&
        cell.player !== gameState.turn &&
        gameState.isUsersTurn
      );
    };

    const isValidCaptureMoveByOpponent = (cell?: CellData) => {
      return (
        cell?.isValidMove &&
        !gameState.isWatcher &&
        [Side.White, Side.Black].includes((cell.player ?? "") as Side) &&
        cell.player !== gameState.turn &&
        !gameState.isUsersTurn
      );
    };

    const isValidMoveForWatcher = (cell?: CellData) => {
      return cell?.isValidMove && gameState.isWatcher;
    };

    const isValidMoveBySelf = (cell?: CellData) => {
      return cell?.isValidMove && gameState.isUsersTurn;
    };

    const isValidMoveByOpponent = (cell?: CellData) => {
      return (
        cell?.isValidMove && !gameState.isWatcher && !gameState.isUsersTurn
      );
    };

    const isWhitePiece = (cell?: CellData) => {
      return cell?.player === Side.White;
    };

    const isBlackPiece = (cell?: CellData) => {
      return cell?.player === Side.Black;
    };

    const cell = board.cells.get(uid);

    const allClassNames = [
      "bg-blue-300",
      "bg-yellow-200",
      "bg-red-200",
      "bg-yellow-100",
      "bg-slate-200",
      "text-slate-900",
      "bg-slate-900",
      "text-slate-200",
      bgClass,
    ];

    let add!: string[];

    if (isHoveredForWatcher(cell) || isHoveredByOpponent(cell)) {
      add = ["bg-blue-300"];
    } else if (isSelectedForWatcher(cell) || isSelectedByOpponent(cell)) {
      add = ["bg-yellow-200"];
    } else if (isHoveredBySelf(cell)) {
      add = ["bg-blue-300", "cursor-pointer"];
    } else if (isSelectedBySelf(cell)) {
      add = ["bg-yellow-200", "cursor-pointer"];
    } else if (
      isValidCaptureMoveForWatcher(cell) ||
      isValidCaptureMoveByOpponent(cell)
    ) {
      add = ["bg-red-200"];
    } else if (isValidCaptureMoveBySelf(cell)) {
      add = ["bg-red-200", "cursor-pointer"];
    } else if (isValidMoveForWatcher(cell) || isValidMoveByOpponent(cell)) {
      add = ["bg-yellow-100"];
    } else if (isValidMoveBySelf(cell)) {
      add = ["bg-yellow-100", "cursor-pointer"];
    } else if (isWhitePiece(cell)) {
      add = ["bg-slate-200", "text-slate-900"];
    } else if (isBlackPiece(cell)) {
      add = ["bg-slate-900", "text-slate-200"];
    } else {
      add = [bgClass];
    }

    cellRef.current?.classList.remove(...[...allClassNames, ...add]);
    cellRef.current?.classList.add(...add);
  }, [board.cells]);

  return (
    <div
      ref={cellRef}
      className={`h-20 w-20 flex items-center justify-center border border-slate-100 cursor-default rounded-md font-bold shadow-sm shadow-gray-200`}
      onMouseEnter={() => board.onMouseEnterCell(uid)}
      onMouseLeave={() => board.onMouseLeaveCell(uid)}
      onClick={() => board.onClickCell(uid)}
    >
      {prettyPiece(board.cells.get(uid)?.piece!)[0]}
    </div>
  );
});
