import { GameProvider } from "../context/game/provider";
import { ChessGame } from "./components/chess-game.tsx";

export function Index() {
  return (
    <GameProvider>
      <ChessGame />
    </GameProvider>
  );
}
