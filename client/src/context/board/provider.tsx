import { useState } from "react";

import { BoardContext } from "./create-context";
import {
  Piece,
  Side,
  useGameState,
} from "../../hooks/use-game-state";

export interface CellData {
  piece?: Piece;
  player?: Side;
  state?: "initial" | "dirty" | "left" | "queened";
  isHovered: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  uid: string;
  id: string;
}

export type Cells = Map<string, CellData>;

interface Cell {}

export interface BoardReturn {
  board: Cell[][];
  cells: Cells;

  onMouseEnterCell: (uid: string) => void;
  onMouseLeaveCell: (uid: string) => void;
  onClickCell: (uid: string) => void;
}

const initialCells = new Map();

const board: Cell[][] = new Array(8).fill(null).map(() => new Array(8).fill(0));

const getIdForPosition = (rowIndex: number, colIndex: number): string => {
  return `${["a", "b", "c", "d", "e", "f", "g", "h"][rowIndex]}${colIndex + 1}`;
};

const getInitialPieceAtPosition = (
  rowIndex: number,
  colIndex: number,
): Piece | undefined => {
  if (rowIndex > 1 && rowIndex < 6) return undefined;
  if (rowIndex === 1 || rowIndex === 6) return Piece.Pawn;
  if (colIndex === 0 || colIndex === 7) return Piece.Rook;
  if (colIndex === 1 || colIndex === 6) return Piece.Knight;
  if (colIndex === 2 || colIndex === 5) return Piece.Bishop;
  if ((rowIndex === 0 && colIndex === 3) || (rowIndex === 7 && colIndex === 4))
    return Piece.Queen;
  return Piece.King;
};

const getInitialPlayerAtPosition = (rowIndex: number): Side | undefined => {
  if (rowIndex < 2) return Side.White;
  if (rowIndex > 5) return Side.Black;
  return;
};

for (let r = 0; r < board.length; r++) {
  for (let c = 0; c < board[r].length; c++) {
    const uid = `${r}-${c}`;
    initialCells.set(uid, {
      id: getIdForPosition(r, c),
      piece: getInitialPieceAtPosition(r, c),
      player: getInitialPlayerAtPosition(r),
      isHovered: false,
      isSelected: false,
      isValidMove: false,
      state: "initial",
      uid: uid,
      rowIndex: r,
      colIndex: c,
    });
  }
}

export function BoardProvider({ children }) {
  const gameState = useGameState();

  const [cells, setCells] = useState<Cells>(initialCells);
  const [lastHoveredCell, setLastHoveredCell] = useState<CellData | undefined>(
    undefined,
  );
  const [lastSelectedCell, setLastSelectedCell] = useState<
    CellData | undefined
  >(undefined);
  const [lastValidMoveCells, lastValidMovesCell] = useState<
    CellData | undefined
  >(undefined);

  function onClickCell(uid: string, isIncoming: boolean): void {
    if (!gameState.canInteractWithCell(uid)) return;

    setCells((prevCells) => {
      const newCells = new Map(prevCells);
      const currentCell = newCells.get(uid);

      if (lastSelectedCell && lastSelectedCell.uid !== uid) {
        const previousCell = newCells.get(lastSelectedCell.uid);
        previousCell.isSelected = false;
        newCells.set(previousCell.uid, previousCell);
      }

      currentCell.isSelected = !currentCell.isSelected;
      newCells.set(uid, currentCell);
      setLastSelectedCell(currentCell.isSelected ? currentCell : null);

      if (!isIncoming) {
        gameState.clickCell(uid, () => {
          // rollback
        });
      }

      return newCells;
    });
  }

  function onMouseEnterCell(uid: string): void {
    if (!gameState.canInteractWithCell(uid)) return;

    setCells((prevCells) => {
      const nextCells = new Map(prevCells);
      const currentCell = nextCells.get(uid);

      if (lastHoveredCell && lastHoveredCell.uid !== uid) {
        lastHoveredCell.isHovered = false;
        nextCells.set(lastHoveredCell.uid, lastHoveredCell);
      }

      currentCell.isHovered = true;
      nextCells.set(uid, currentCell);
      setLastHoveredCell(currentCell);

      gameState.mouseEnterCell(uid, () => {
        // rollback
      });

      return nextCells;
    });
  }

  function onMouseLeaveCell(uid: string): void {
    if (!gameState.canInteractWithCell(uid)) return;

    setCells((prevCells) => {
      const newCells = new Map(prevCells);
      const currentCell = newCells.get(uid);

      currentCell.isHovered = false;
      newCells.set(uid, currentCell);

      if (lastHoveredCell && lastHoveredCell.uid === uid) {
        setLastHoveredCell(null);
      }

      gameState.mouseLeaveCell(uid);

      return newCells;
    });
  }

  gameState.cellClicked(uid, (uid: string): void => {
    onClickCell(uid, true)
  });
  gameState.mouseEnteredCell(uid, (uid: string): void => {
    onMouseEnterCell(uid, true);
  });
  gameState.mouseLeftCell(uid, (uid: string): void => {
    onMouseLeaveCell(uid, true),
  });

  return (
    <BoardContext.Provider
      value={{
        board,
        cells,

        onClickCell,
        onMouseEnterCell,
        onMouseLeaveCell,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
