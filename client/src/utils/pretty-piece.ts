import { Piece } from "../hooks/use-game-state";

export const prettyPiece = (piece: Piece): string => {
  switch (piece) {
    case Piece.King:
      return "King";
    case Piece.Queen:
      return "Queen";
    case Piece.Rook:
      return "Rook";
    case Piece.Knight:
      return "Knight";
    case Piece.Bishop:
      return "Bishop";
    case Piece.Pawn:
      return "Pawn";
    default:
      return "";
  }
};
