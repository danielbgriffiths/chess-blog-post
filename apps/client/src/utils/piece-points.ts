import { Piece } from "../hooks/use-game-state";

export function piecePoints(piece: Piece): number {
  if (piece === Piece.Pawn) return 1;
  if (piece === Piece.Knight || piece === Piece.Bishop) return 3;
  if (piece === Piece.Rook) return 5;
  if (piece === Piece.Queen) return 9;
  return 10;
}
