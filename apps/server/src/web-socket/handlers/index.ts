import { Server, Socket } from "socket.io";
import { EventName, Side, GameState } from "@chess-blog-post/common";

import { OnlineUsers, OnlineUser } from "../../models/online-user";
import { OnlineRooms } from "../../models/online-room";

export interface HandlersReturn {
  connection(): void;
  joinGameToWatch(roomUid: string, callback: Function): void;
  joinGameToPlay(roomUid: string, callback: Function): void;
  createGame(callback: Function): void;
  leaveGame(callback: Function): void;
  disconnect(): void;
  selectSide(side: Side, callback: Function): void;
  clickCellToMove(nextGameState: GameState, callback: Function): void;
}

export function handlers(
  io: Server,
  socket: Socket,
  onlineUsers: OnlineUsers,
  onlineRooms: OnlineRooms,
): HandlersReturn {
  function emitState(roomUid?: string): void {
    io.emit(EventName.OnlineRoomsUpdate, onlineRooms.toSocket());
    io.emit(EventName.OnlineUsersUpdate, onlineUsers.toSocket());
    if (!roomUid) return;
    const room = onlineRooms.get(roomUid);
    socket.emit(EventName.RoomDataUpdate, room.toSocket());
    io.to(roomUid).emit(EventName.RoomDataUpdate, room.toSocket());
  }

  function connection() {
    socket.emit(EventName.Connected, socket.id);

    onlineUsers.create(socket.id);

    socket.broadcast.emit(
      EventName.ConnectionWelcomeMessage,
      `A new user, ${socket.id}, has entered the server` as any,
    );

    emitState();
  }

  function joinGameToWatch(roomUid: string, callback: Function): void {
    if (onlineUsers.get(socket.id).isInRoom()) {
      callback({ status: "failed", roomUid, joinType: "watcher" });
      return;
    }

    socket.join(roomUid);

    onlineUsers.get(socket.id).addRoom(roomUid);
    onlineUsers.get(socket.id).updateStatusPairedAsWatcher();
    onlineRooms.get(roomUid).addWatcherToGame(socket.id);

    emitState(roomUid);

    callback({
      status: "success",
      room: onlineRooms.get(roomUid).toSocket(),
    });
  }

  function joinGameToPlay(roomUid: string, callback: Function): void {
    if (onlineUsers.get(socket.id).isInRoom() || !onlineRooms.has(roomUid)) {
      callback({ status: "failed", roomUid, joinType: "player" });
      return;
    }

    socket.join(roomUid);

    for (const playerUid of onlineRooms.get(roomUid).getPlayerUids()) {
      onlineUsers.get(playerUid).addRoom(roomUid);
      onlineUsers.get(playerUid).updateStatusPairedAsPlayer();
    }
    onlineRooms.get(roomUid).addPlayerToGame(socket.id);

    emitState(roomUid);

    callback({ status: "success", room: onlineRooms.get(roomUid).toSocket() });
  }

  function createGame(callback: Function): void {
    if (onlineUsers.get(socket.id).isInRoom()) {
      callback({ status: "failed" });
      return;
    }

    const newGameRoomUid = onlineRooms.getRoomUid(socket.id);

    socket.join(newGameRoomUid);

    onlineRooms.create(newGameRoomUid, socket.id);
    onlineUsers.get(socket.id).addRoom(newGameRoomUid);
    onlineUsers.get(socket.id).updateStatusPending();

    emitState(newGameRoomUid);

    callback({
      status: "success",
      room: onlineRooms.get(newGameRoomUid).toSocket(),
    });
  }

  function leaveGame(callback: Function): void {
    const roomUid = onlineUsers.get(socket.id).getRoomUid()!;
    const isPlayer = onlineRooms.get(roomUid).isPlayer(socket.id);
    const isWatcher = onlineRooms.get(roomUid).isWatcher(socket.id);

    socket.leave(roomUid);

    io.to(roomUid).emit(
      EventName.LeavingGame,
      `${socket.id} stopped ${isPlayer ? "playing" : isWatcher ? "watching" : ""} game` as string,
    );

    if (isPlayer) {
      io.to(roomUid).emit(
        EventName.PlayerLeftGame,
        onlineRooms.get(roomUid).watcherUidsToSocket(),
      );

      onlineUsers.get(socket.id).updateStatusWaiting();
      onlineRooms.get(roomUid).deletePlayerUid(socket.id);

      for (const watcherUid of onlineRooms.get(roomUid).getWatcherUids()) {
        onlineUsers.get(watcherUid).updateStatusWaiting();
        onlineRooms.get(roomUid).deleteWatcherUid(watcherUid);
      }

      for (const playerUid of onlineRooms.get(roomUid).getPlayerUids()) {
        onlineUsers.get(playerUid).updateStatusPending();
      }
    } else if (isWatcher) {
      onlineUsers.get(socket.id).updateStatusWaiting();
      onlineRooms.get(roomUid).deleteWatcherUid(socket.id);
    }

    emitState(roomUid);

    callback({ status: "success" });
  }

  function selectSide(side: Side, callback: Function): void {
    const roomUid = onlineUsers.get(socket.id).getRoomUid();

    if (!roomUid) {
      return callback({ status: "failed" });
    }

    onlineRooms.get(roomUid).updateSide(socket.id, side);

    emitState(roomUid);

    callback({ status: "success" });
  }

  function clickCellToMove(nextGameState: GameState, callback: Function): void {
    const roomUid = onlineUsers.get(socket.id).getRoomUid();

    if (!roomUid) {
      return callback({ status: "failed" });
    }

    onlineRooms.get(roomUid).updateGameState(nextGameState);

    emitState(roomUid);

    io.to(roomUid).emit(
      EventName.CellClickedWithMove,
      onlineRooms.get(roomUid).gameState,
    );

    callback({ status: "success" });
  }

  function disconnect(): void {}

  return {
    connection,
    joinGameToWatch,
    joinGameToPlay,
    createGame,
    leaveGame,
    disconnect,
    selectSide,
    clickCellToMove,
  };
}
