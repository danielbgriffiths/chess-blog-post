import { GameStatus, useGameState } from "../../../hooks/use-game-state";
import { SideSelector } from "./side-selector";

export function BoardOverlay() {
  const gameState = useGameState();

  if (gameState.status === GameStatus.InProgress) return <></>;

  return (
    <div className="flex justify-center items-center absolute top-0 left-0 w-full h-full z-10">
      <div className="w-full h-full opacity-30 bg-slate-300 absolute top-0 left-0 z-10" />
      {gameState.status === GameStatus.Ready && (
        <h2 className="rounded-md p-8 text-2xl text-gray-50 uppercase bg-slate-500 shadow-2xl shadow-gray-500 z-20">
          Game Ready
        </h2>
      )}
      {gameState.status === GameStatus.Setup && !gameState.isWatcher && (
        <SideSelector />
      )}
      {gameState.status === GameStatus.Setup && gameState.isWatcher && (
        <h2 className="rounded-md p-8 text-2xl text-gray-50 uppercase bg-slate-500 shadow-2xl shadow-gray-500 z-20">
          Players Are Choosing Sides
        </h2>
      )}
      {gameState.status === GameStatus.Paused && (
        <h2 className="rounded-md p-8 text-2xl text-gray-50 uppercase bg-slate-500 shadow-2xl shadow-gray-500 z-20">
          Game Paused
        </h2>
      )}
      {gameState.status === GameStatus.Ended && (
        <h2 className="rounded-md p-8 text-2xl text-gray-50 uppercase bg-slate-500 shadow-2xl shadow-gray-500 z-20">
          Finished Game!
        </h2>
      )}
    </div>
  );
}
