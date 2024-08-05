import { Player } from "../context/board/provider";

export function prettyPlayer(player: Player): string {
  switch (player) {
    case Player.Dark:
      return "Dark";
    case Player.Light:
      return "Light";
    default:
      return "";
  }
}
