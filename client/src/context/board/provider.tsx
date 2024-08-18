import { useState } from "react";

import { BoardContext } from "./create-context";
import { Piece, Side, useGameState } from "../../hooks/use-game-state";

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

  function onMouseEnterCell(uid: string): void {
    //
  }

  function onMouseLeaveCell(uid: string): void {
    //
  }

  function onClickCell(uid: string): void {
    if (!gameState.canInteractWithCell(uid)) return;

    if (!!lastSelectedCell?.uid && lastSelectedCell?.uid !== uid) {
      gameState.clickCell(
        { to: uid, from: lastSelectedCell?.uid },
        (response) => {
          // Handle change to board state based on this new gameState
        },
        (response) => {
          // Handle change to board state based on this new gameState
        },
      );
    } else {
      // Update selected cell
    }
  }

  gameState.cellClicked((payload) => {
    // Handle board change state based on this new game state
  });

  return (
    <BoardContext.Provider
      value={{
        board,
        cells,

        onMouseEnterCell,
        onMouseLeaveCell,
        onClickCell,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
