import { GameProvider } from "../context/game/provider";
import { ChessGame } from "../components/chess-game";

export function GameSpace() {
  return (
    <GameProvider>
      <ChessGame />
    </GameProvider>
  );
}
