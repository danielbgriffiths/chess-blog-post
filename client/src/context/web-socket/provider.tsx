import { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";

import { WebsocketContext } from "./create-context";

export enum EventName {
  Connect = "connect",
  PlayGameSucceeded = "play-game-succeeded",
  WatchGameSucceeded = "watch-game-succeeded",
  PlayGameFailed = "play-game-failed",
  WatchGameFailed = "watch-game-failed",
  JoinGameToWatch = "join-game-to-watch",
  JoinGameToPlay = "join-game-to-play",
  CreateGameSucceeded = "create-game-succeeded",
  CreateGameFailed = "create-game-failed",
  CreateGame = "create-game",
  LeaveGame = "leave-game",
  OnlineRoomsUpdate = "online-rooms-update",
  OnlineUsersUpdate = "online-users-update",
}

export enum UserStatus {
  Waiting,
  Pending,
  PairedPlayer,
  PairedWatcher,
}

export type UserData = {
  uid: string;
  username: string;
  status: UserStatus;
  createdAt: string;
  wins: number;
  losses: number;
  room: RoomData;
};

export type RoomData = {
  uid: string;
  name: string;
  size: number;
};

export type UserDataMap = Map<string, UserData>;

export type RoomDataMap = Map<string, RoomData>;

export interface WebSocketReturn {
  userUid: string;
  onlineRooms: RoomDataMap;
  onlineUsers: UserDataMap;

  joinGameToWatch: (roomUid: string) => void;
  joinGameToPlay: (roomUid: string) => void;
  createGame: () => void;
  leaveGame: () => void;

  listen: (event: EventName, handler: (...args: unknown[]) => void) => void;
}

const SOCKET_SERVER_URL = "http://localhost:4000";

const socket = io(SOCKET_SERVER_URL);

export function WebSocketProvider({ children }) {
  const [userUid, setUserUid] = useState<string>(
    undefined as unknown as string,
  );
  const [onlineRooms, setOnlineRooms] = useState<RoomDataMap>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<UserDataMap>(new Map());

  useEffect(() => {
    function onConnect(nextUserUid: string): void {
      setUserUid(nextUserUid);
    }

    function onOnlineRoomsUpdate(nextOnlineRooms: RoomDataMap): void {
      setOnlineRooms(nextOnlineRooms);
    }

    function onOnlineUsersUpdate(nextOnlineUsers: UserDataMap): void {
      setOnlineUsers(nextOnlineUsers);
    }

    socket.off(EventName.Connect).on(EventName.Connect, onConnect);
    socket
      .off(EventName.OnlineRoomsUpdate)
      .on(EventName.OnlineRoomsUpdate, onOnlineUsersUpdate);
    socket
      .off(EventName.OnlineUsersUpdate)
      .on(EventName.OnlineUsersUpdate, onOnlineRoomsUpdate);

    return () => {
      socket.off(EventName.Connect);
      socket.off(EventName.OnlineRoomsUpdate);
      socket.off(EventName.OnlineUsersUpdate);
    };
  }, []);

  useEffect(() => {
    toast(`Connected to server as ${userUid}`);
  }, [userUid]);

  function joinGameToWatch(roomUid: string): void {
    socket.emit(EventName.JoinGameToWatch, roomUid);
  }

  function joinGameToPlay(roomUid: string): void {
    socket.emit(EventName.JoinGameToPlay, roomUid);
  }

  function createGame(): void {
    socket.emit(EventName.CreateGame);
  }

  function leaveGame(): void {
    if (!onlineUsers.get(userUid)?.room?.uid) return;
    socket.emit(EventName.LeaveGame);
  }

  const listen = useCallback(
    (eventName: EventName, handler: (...args: unknown[]) => void) => {
      if (!socket) return;

      socket.off(eventName).on(eventName, handler);

      return (): void => {
        socket.off(eventName);
      };
    },
    [userUid],
  );

  return (
    <WebsocketContext.Provider
      value={{
        userUid,
        onlineUsers,
        onlineRooms,

        joinGameToWatch,
        joinGameToPlay,
        createGame,
        leaveGame,

        listen,
      }}
    >
      {children}
    </WebsocketContext.Provider>
  );
}
