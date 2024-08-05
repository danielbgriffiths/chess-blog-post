import { Server } from "socket.io";

import { CONNECTION, DISCONNECT } from "../constants";
import { EventName } from "../types";
import { OnlineUsers } from "../models/online-user";
import { OnlineRooms } from "../models/online-room";
import { handlers } from "./handlers";

export function createWebSocketServer(
  onlineUsers: OnlineUsers,
  onlineRooms: OnlineRooms,
): void {
  const io: Server = require("socket.io")(4000, {
    cors: {
      origin: "*",
    },
  });

  io.on(CONNECTION, (socket): void => {
    const {
      connection,
      joinGameToWatch,
      joinGameToPlay,
      createGame,
      leaveGame,
      disconnect,
    } = handlers(io, socket, onlineUsers, onlineRooms);

    connection();

    socket.on(EventName.JoinGameToWatch, (roomUid: string, callback) => {
      return joinGameToWatch(roomUid, callback);
    });
    socket.on(EventName.JoinGameToPlay, (roomUid: string, callback) => {
      return joinGameToPlay(roomUid, callback);
    });

    socket.on(EventName.CreateGame, (callback) => {
      return createGame(callback);
    });

    socket.on(EventName.LeaveGame, (roomUid: string, callback) => {
      return leaveGame(roomUid, callback);
    });

    socket.on(DISCONNECT, () => {
      return disconnect();
    });
  });
}
