import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { UsersList } from "./components/users-list";
import { InitialGameClickZone } from "./components/initial-game-click-zone";
import { RouteName } from "../../router";
import { useGameState } from "../../hooks/use-game-state";
import { useWebSocket } from "../../context/web-socket/use-context";

export function LandingPage() {
  const websocket = useWebSocket();
  const gameState = useGameState();
  const navigate = useNavigate();

  function onClickCreateGame(): void {
    gameState.createGame(
      (response) => {
        toast(`Success creating ${(response.room as any).uid} game`);
        navigate(RouteName.GameSpace);
      },
      () => {
        toast.error("Failed to create new game");
      },
    );
  }

  function onClickPlayGame(roomUid: string): void {
    gameState.joinGameToPlay(
      roomUid,
      () => {
        toast(`Success joining ${roomUid} as player`);
        navigate(RouteName.GameSpace);
      },
      () => {
        toast.error(`Failed to join game ${roomUid} as player`);
      },
    );
  }

  function onClickWatchGame(roomUid: string): void {
    gameState.joinGameToWatch(
      roomUid,
      () => {
        toast(`Success joining ${roomUid} as observer`);
        navigate(RouteName.GameSpace);
      },
      () => {
        toast.error(`Failed to join game ${roomUid} as observer`);
      },
    );
  }

  return (
    <>
      <header className="p-4 md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Online Chess Blog Tutorial
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            type="button"
            onClick={onClickCreateGame}
            className="ml-3 inline-flex items-center rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
          >
            Create Game
          </button>
        </div>
      </header>
      <main className="flex justify-center items-center h-main">
        <div className="max-w-2xl w-full">
          <div className="border-b border-gray-200 pb-5">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Online Players
            </h3>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Select a player who is in pending state to enter their game!
            </p>
          </div>
          {websocket.onlineRooms.size > 1 ? (
            <UsersList
              onlineRooms={websocket.onlineRooms}
              otherOnlineUsers={Array.from(
                websocket.onlineUsers.values(),
              ).filter((user) => user.uid !== websocket.userUid)}
              onClickWatchGame={onClickWatchGame}
              onClickPlayGame={onClickPlayGame}
            />
          ) : (
            <InitialGameClickZone onClickCreateGame={onClickCreateGame} />
          )}
        </div>
      </main>
    </>
  );
}
