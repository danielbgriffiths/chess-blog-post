import { Piece, Side } from "@chess-blog-post/common";

import { CellData, Cells } from "../context/board/provider";

function addMove(
  nextRowIndex: number,
  nextColIndex: number,
  turn: Side,
  cells: Cells,
  nextValidMoveUIDs: Set<string>,
  maxDepth?: number,
): boolean {
  if (
    nextRowIndex < 0 ||
    nextRowIndex >= 8 ||
    nextColIndex < 0 ||
    nextColIndex >= 8
  ) {
    return false;
  }

  const targetUID = `${nextRowIndex}-${nextColIndex}`;
  const targetCellData = cells.get(targetUID)!;

  if (targetCellData.piece && targetCellData.player === turn) return false;

  if (targetCellData.piece && targetCellData.player !== turn) {
    nextValidMoveUIDs.add(targetUID);
    return false;
  }

  nextValidMoveUIDs.add(targetUID);

  return maxDepth !== 1;
}

function getNextPawnValidMoveUIDs(
  cell: CellData,
  turn: Side,
  cells: Cells,
): Set<string> {
  const [subjectRowIndex, subjectColIndex] = cell.uid
    .split("-")
    .map((i) => parseInt(i));

  let nextValidMoveUIDs = new Set<string>();

  const direction = turn === Side.White ? 1 : -1;
  const nextRowIndex = subjectRowIndex + direction;
  const specialNextRowIndex = subjectRowIndex + 2 * direction;
  const nextUID = `${nextRowIndex}-${subjectColIndex}`;
  const specialNextUID = `${specialNextRowIndex}-${subjectColIndex}`;
  const captureLeftNextUID = `${nextRowIndex}-${subjectColIndex - 1}`;
  const captureRightNextUID = `${nextRowIndex}-${subjectColIndex + 1}`;

  if (nextRowIndex >= 0 && nextRowIndex < 8 && !cells.get(nextUID)?.piece) {
    addMove(nextRowIndex, subjectColIndex, turn, cells, nextValidMoveUIDs, 1);
    if (cell.state === "initial" && !cells.get(specialNextUID)?.piece) {
      addMove(
        specialNextRowIndex,
        subjectColIndex,
        turn,
        cells,
        nextValidMoveUIDs,
        1,
      );
    }
  }

  const captureLeft = cells.get(captureLeftNextUID);
  if (captureLeft?.player && captureLeft.player !== turn) {
    addMove(
      nextRowIndex,
      subjectColIndex - 1,
      turn,
      cells,
      nextValidMoveUIDs,
      1,
    );
  }
  const captureRight = cells.get(captureRightNextUID);
  if (captureRight?.player && captureRight.player !== turn) {
    addMove(
      nextRowIndex,
      subjectColIndex + 1,
      turn,
      cells,
      nextValidMoveUIDs,
      1,
    );
  }

  return nextValidMoveUIDs;
}

type MoveFn = (cell: CellData, turn: Side, cells: Cells) => Set<string>;

function moveFactory(
  directions: [number, number][],
  maxDepth?: number,
): MoveFn {
  return (cell: CellData, turn: Side, cells: Cells): Set<string> => {
    const [subjectRowIndex, subjectColIndex] = cell.uid
      .split("-")
      .map((i) => parseInt(i));

    let nextValidMoveUIDs = new Set<string>();

    for (const direction of directions) {
      const [dirRowIndex, dirColIndex] = direction;
      let nextRowIndex = subjectRowIndex + dirRowIndex;
      let nextColIndex = subjectColIndex + dirColIndex;

      while (
        addMove(
          nextRowIndex,
          nextColIndex,
          turn,
          cells,
          nextValidMoveUIDs,
          maxDepth,
        )
      ) {
        nextRowIndex += dirRowIndex;
        nextColIndex += dirColIndex;
      }
    }

    return nextValidMoveUIDs;
  };
}

export function getValidMoves(
  cell: CellData,
  turn: Side,
  cells: Cells,
): Set<string> {
  let moveFn!: MoveFn;

  if (cell.piece === Piece.King) {
    moveFn = moveFactory(
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ],
      1,
    );
  } else if (cell.piece === Piece.Queen) {
    moveFn = moveFactory(
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ],
      -1,
    );
  } else if (cell.piece === Piece.Bishop) {
    moveFn = moveFactory(
      [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ],
      -1,
    );
  } else if (cell.piece === Piece.Knight) {
    moveFn = moveFactory(
      [
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [1, -2],
        [-1, 2],
        [-1, -2],
      ],
      1,
    );
  } else if (cell.piece === Piece.Rook) {
    moveFn = moveFactory(
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ],
      -1,
    );
  } else {
    moveFn = getNextPawnValidMoveUIDs;
  }

  return moveFn(cell, turn, cells);
}
