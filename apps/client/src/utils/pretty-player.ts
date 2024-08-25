import { Side } from "../hooks/use-game-state";

export function prettyPlayer(player: Side): string {
  switch (player) {
    case Side.Black:
      return "Black";
    case Side.White:
      return "White";
    default:
      return "";
  }
}
