import { useNavigate } from "react-router-dom";

import { useWebSocket, EventName } from "../context/web-socket/use-context";
import { UsersList } from "../components/users-list";
import { InitialGameClickZone } from "../components/initial-game-click-zone";
import { Route } from "../router";

export function LandingPage() {
  const websocket = useWebSocket();
  const navigate = useNavigate();

  function onClickCreateGame(): void {
    websocket.createGame();
  }

  function onClickJoinGame(roomUid: string): void {
    websocket.joinGameToPlay(roomUid);
  }

  function onClickWatchGame(roomUid: string): void {
    websocket.joinGameToWatch(roomUid);
  }

  function onJoinOrWatchGame(): void {
    navigate(Route.GameSpace);
  }

  websocket.listen(EventName.JoinedGame, onJoinOrWatchGame);
  websocket.listen(EventName.WatchingGame, onJoinOrWatchGame);

  return (
    <>
      <header className="md:flex md:items-center md:justify-between">
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
      <main>
        <div>
          <div className="border-b border-gray-200 pb-5">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Online Players
            </h3>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Select a player who is in pending state to enter their game!
            </p>
          </div>
          {websocket.onlineUsers.length ? (
            <UsersList
              onlineUsers={websocket.onlineUsers}
              onClickJoinGame={onClickJoinGame}
              onClickWatchGame={onClickWatchGame}
            />
          ) : (
            <InitialGameClickZone onClickCreateGame={onClickCreateGame} />
          )}
        </div>
      </main>
    </>
  );
}
