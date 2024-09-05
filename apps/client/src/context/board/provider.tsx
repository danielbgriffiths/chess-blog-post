import { PropsWithChildren, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  GameState,
  GameStatus,
  HistoryRecord,
  Piece,
  Side,
} from "@chess-blog-post/common";

import { BoardContext } from "./create-context";
import { useGameState } from "../../hooks/use-game-state";
import { useWebSocket } from "../web-socket/use-context";
import { getValidMoves } from "../../utils/get-valid-moves";

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

export function BoardProvider({ children }: PropsWithChildren) {
  const gameState = useGameState();
  const { userUid } = useWebSocket();

  const moveFailRollback = useRef<Cells>();

  const [cells, setCells] = useState<Cells>(initialCells);
  const [_hoveredCell, setHoveredCell] = useState<CellData | undefined>(
    undefined,
  );
  const [selectedCell, setSelectedCell] = useState<CellData | undefined>(
    undefined,
  );
  const [validMoveCells, setValidMoveCells] = useState<CellData[]>([]);

  function isPlayersCell(cellUid: string, userUid: string): boolean {
    return cells.get(cellUid)!.player === Side.Black
      ? gameState.blackUid === userUid
      : gameState.whiteUid === userUid;
  }

  function isCellAValidMove(cellUid: string): boolean {
    return !!(validMoveCells || []).filter((cell) => cell.uid === cellUid)
      .length;
  }

  function onMouseEnterCell(uid: string): void {
    if (!gameState.canInteractWithCell(uid)) return;
    if (!selectedCell && !isPlayersCell(uid, userUid)) return;
    if (selectedCell && !isCellAValidMove(uid)) return;

    setCells((prevCells) => {
      const nextCells = new Map(prevCells);

      nextCells.set(uid, { ...nextCells.get(uid)!, isHovered: true });

      let validMoveUids!: Set<string>;
      if (!selectedCell) {
        validMoveUids = getValidMoves(
          nextCells.get(uid)!,
          gameState.turn,
          nextCells,
        );
        for (const [cellUid, cellData] of nextCells.entries()) {
          nextCells.set(cellUid, {
            ...cellData,
            isValidMove: validMoveUids.has(cellUid),
          });
        }
      }

      setHoveredCell(nextCells.get(uid)!);

      if (!selectedCell) {
        setValidMoveCells(() => {
          return Array.from(validMoveUids).map(
            (validMoveUid) => nextCells.get(validMoveUid)!,
          );
        });
      }

      return nextCells;
    });
  }

  function onMouseLeaveCell(uid: string): void {
    if (!gameState.canInteractWithCell(uid)) return;

    setCells((prevCells) => {
      const nextCells = new Map(prevCells);

      nextCells.set(uid, {
        ...nextCells.get(uid)!,
        isHovered: false,
      });

      if (!selectedCell) {
        for (const [cellUid, cellData] of nextCells.entries()) {
          nextCells.set(cellUid, {
            ...cellData,
            isValidMove: false,
          });
        }
      }

      setHoveredCell(undefined);

      if (!selectedCell) {
        setValidMoveCells([]);
      }

      return nextCells;
    });
  }

  function handleFreshClickSelection(uid: string): void {
    setCells((prevCells) => {
      const nextCells = new Map(prevCells);

      nextCells.set(uid, {
        ...nextCells.get(uid)!,
        isSelected: true,
      });

      const validMoveUids = getValidMoves(
        nextCells.get(uid)!,
        gameState.turn,
        nextCells,
      );
      for (const [cellUid, cellData] of nextCells.entries()) {
        nextCells.set(cellUid, {
          ...cellData,
          isValidMove: validMoveUids.has(cellUid),
        });
      }

      setHoveredCell(undefined);
      setSelectedCell(
        nextCells.get(uid)!.isSelected ? nextCells.get(uid) : undefined,
      );
      setValidMoveCells(() => {
        return Array.from(validMoveUids).map(
          (validMoveUid) => nextCells.get(validMoveUid)!,
        );
      });

      return nextCells;
    });
  }

  function handleBacktrackClickSelection(uid: string): void {
    setCells((prevCells) => {
      const nextCells = new Map(prevCells);

      nextCells.set(uid, {
        ...nextCells.get(uid)!,
        isSelected: false,
      });

      for (const [cellUid, cellData] of nextCells.entries()) {
        nextCells.set(cellUid, {
          ...cellData,
          isValidMove: false,
        });
      }

      setHoveredCell(undefined);
      setSelectedCell(
        nextCells.get(uid)!.isSelected ? nextCells.get(uid) : undefined,
      );
      setValidMoveCells([]);

      return nextCells;
    });
  }

  function handleClickToMove(uid: string): void {
    const nextGameState: GameState = {
      white: gameState.whiteUid,
      black: gameState.blackUid,
      turn: gameState.turn === Side.White ? Side.Black : Side.White,
      status: GameStatus.InProgress,
      whiteCaptures: gameState.whiteCaptures,
      blackCaptures: gameState.blackCaptures,
      history: gameState.history,
    };

    moveFailRollback.current = cells;

    setCells((prevCells) => {
      let removedPiece!: Piece;

      const nextCells = new Map(prevCells);
      const clickedCell = nextCells.get(uid)!;

      if (clickedCell.player) {
        removedPiece = clickedCell.piece!;
      }

      const selectedCellData = nextCells.get(selectedCell!.uid!)!;

      clickedCell.player = selectedCellData.player;
      clickedCell.piece = selectedCellData.piece;
      clickedCell.isSelected = false;
      clickedCell.state = "dirty";
      if (
        clickedCell.piece === Piece.Pawn &&
        (parseInt(clickedCell.uid.split("-")[0]) === 0 ||
          parseInt(clickedCell.uid.split("-")[0]) === 7)
      ) {
        clickedCell.piece = Piece.Queen;
        clickedCell.state = "queened";
      }

      selectedCellData.player = undefined;
      selectedCellData.piece = undefined;
      selectedCellData.isSelected = false;
      selectedCellData.state = "left";

      nextCells.set(uid, clickedCell);
      nextCells.set(selectedCell!.uid, selectedCellData);

      for (const [cellUid, cellData] of nextCells.entries()) {
        nextCells.set(cellUid, {
          ...cellData,
          isValidMove: false,
        });
      }

      setHoveredCell(undefined);
      setSelectedCell(undefined);
      setValidMoveCells([]);

      const nextHistoryItem: HistoryRecord = {
        timestamp: new Date().toISOString(),
        piece: selectedCell!.piece!,
        from: selectedCell!.uid,
        to: clickedCell.uid,
        turn: gameState.turn,
        capture: removedPiece,
        fromCheck: false,
        toCheck: false,
        toCheckMate: false,
      };

      nextGameState.history = [nextHistoryItem, ...nextGameState.history];

      if (gameState.turn === Side.White) {
        nextGameState.whiteCaptures.push(selectedCell!.piece!);
      } else {
        nextGameState.blackCaptures.push(selectedCell!.piece!);
      }

      return nextCells;
    });

    gameState.clickCellToMove(
      nextGameState,
      (_response) => {
        toast("Moved Piece");
      },
      (_response) => {
        toast.error("Failed to Move Piece");
        setCells(() => moveFailRollback.current!);
      },
    );
  }

  function onClickCell(uid: string): void {
    if (!gameState.canInteractWithCell(uid)) return;
    if (!selectedCell && !isPlayersCell(uid, userUid)) return;
    if (selectedCell && !isCellAValidMove(uid) && uid !== selectedCell.uid)
      return;

    if (!selectedCell) {
      return handleFreshClickSelection(uid);
    }

    if (selectedCell.uid === uid) {
      return handleBacktrackClickSelection(uid);
    }

    handleClickToMove(uid);
  }

  gameState.cellClickedWithMove((_nextGameState: GameState) => {
    setCells((prevCells) => {
      return prevCells;
    });
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
