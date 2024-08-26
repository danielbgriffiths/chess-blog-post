import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { EventName } from "@chess-blog-post/common";

import { CONNECTION, DISCONNECT } from "../constants";
import { OnlineUsers } from "../models/online-user";
import { OnlineRooms } from "../models/online-room";
import { handlers } from "./handlers";

export function createWebSocketServer(
  httpServer: HTTPServer,
  onlineUsers: OnlineUsers,
  onlineRooms: OnlineRooms,
): void {
  const io = new Server(httpServer);

  io.on(CONNECTION, (socket): void => {
    const {
      connection,
      joinGameToWatch,
      joinGameToPlay,
      createGame,
      leaveGame,
      disconnect,
      selectSide,
      clickCellToMove,
    } = handlers(io, socket, onlineUsers, onlineRooms);

    connection();

    for (const listener of [
      { eventName: EventName.JoinGameToPlay, handler: joinGameToPlay },
      { eventName: EventName.JoinGameToWatch, handler: joinGameToWatch },
      { eventName: EventName.CreateGame, handler: createGame },
      { eventName: EventName.LeaveGame, handler: leaveGame },
      { eventName: EventName.SelectSide, handler: selectSide },
      { eventName: EventName.ClickCellToMove, handler: clickCellToMove },
      { eventName: DISCONNECT, handler: disconnect },
    ]) {
      socket.on(listener.eventName, listener.handler);
    }
  });
}
