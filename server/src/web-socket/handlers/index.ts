import { Server, Socket } from "socket.io";

import { OnlineUsers } from "../../models/online-user";
import { OnlineRooms } from "../../models/online-room";

export interface HandlersReturn {
  connection(): void;
  joinGameToWatch(roomUid: string, callback: Function): void;
  joinGameToPlay(roomUid: string, callback: Function): void;
  createGame(callback: Function): void;
  leaveGame(roomUid: string, callback: Function): void;
  disconnect(): void;
}

export function handlers(
  io: Server,
  socket: Socket,
  onlineUsers: OnlineUsers,
  onlineRooms: OnlineRooms,
): HandlersReturn {
  function connection() {}

  function joinGameToWatch(roomUid: string, callback: Function): void {}

  function joinGameToPlay(roomUid: string, callback: Function): void {}

  function createGame(callback: Function): void {}

  function leaveGame(roomUid: string, callback: Function): void {}

  function disconnect(): void {}

  return {
    connection,
    joinGameToWatch,
    joinGameToPlay,
    createGame,
    leaveGame,
    disconnect,
  };
}
