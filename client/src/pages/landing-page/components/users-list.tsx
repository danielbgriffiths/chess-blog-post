import { UserData, UserStatus } from "../../../context/web-socket/provider.tsx";

export function UsersList(props: {
  onlineUsers: UserData[];
  onClickPlayGame: (roomUid: string) => void;
  onClickWatchGame: (roomUid: string) => void;
}) {
  return (
    <ul role="list" className="divide-y divide-gray-100">
      {props.onlineUsers.map((user, userIdx) => {
        const getStatusColor = () => {
          switch (user.status) {
            case UserStatus.Waiting:
              return "yellow";
            case UserStatus.Pending:
              return "green";
            case UserStatus.PairedPlayer:
            case UserStatus.PairedWatcher:
              return "red";
            default:
              return "slate";
          }
        };

        const getStatusLabel = () => {
          switch (user.status) {
            case UserStatus.Waiting:
              return "Waiting";
            case UserStatus.Pending:
              return "Game Available";
            case UserStatus.PairedPlayer:
              return "Paired as Player";
            case UserStatus.PairedWatcher:
              return "Paired as Observer";
            default:
              return "Unknown";
          }
        };

        const statusColor = getStatusColor();
        const statusLabel = getStatusLabel();

        return (
          <li
            key={userIdx}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div className="min-w-0">
              <div className="flex items-start gap-x-3">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  {user.username}
                </p>
                <p
                  className={`mt-0.5 whitespace-nowrap rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-${statusColor}-700 ring-1 ring-inset ring-${statusColor}-600/20`}
                >
                  {statusLabel}
                </p>
              </div>
              <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                <p className="whitespace-nowrap">
                  Created at{" "}
                  <time dateTime="2023-03-17T00:00Z">{user.createdAt}</time>
                </p>
                {(user.status === UserStatus.PairedPlayer ||
                  user.status === UserStatus.PairedWatcher) && (
                  <>
                    <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                      <circle cx="1" cy="1" r="1" />
                    </svg>
                    <p className="truncate">{user.roomName} room</p>
                  </>
                )}
                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                  <circle cx="1" cy="1" r="1" />
                </svg>
                <p className="truncate">
                  {user.wins}-{user.losses} gaming record
                </p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              {user.status === UserStatus.Pending && (
                <button
                  type="button"
                  onClick={() => props.onClickPlayGame(user.roomUid!)}
                  className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                >
                  Play Game
                </button>
              )}
              {(user.status === UserStatus.PairedPlayer ||
                user.status === UserStatus.PairedWatcher) && (
                <button
                  type="button"
                  onClick={() => props.onClickWatchGame(user.roomUid!)}
                  className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                >
                  Watch Game
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
