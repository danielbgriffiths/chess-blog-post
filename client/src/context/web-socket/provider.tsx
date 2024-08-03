import { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";

import { WebSocketContext } from "./create-context";

export interface StatusCallbackPayload {
  status: string;
  [key: string]: unknown;
}

export type StatusCallback = (response: StatusCallbackPayload) => void;

export enum EventName {
  Connected = "connected",
  ConnectionWelcomeMessage = "connection-welcome-message",
  JoinGameToWatch = "join-game-to-watch",
  JoinGameToPlay = "join-game-to-play",
  CreateGame = "create-game",
  LeaveGame = "leave-game",
  PlayerLeftGame = "player-left-game",
  LeavingGame = "leaving-game",
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
  roomUid?: string;
};

export type RoomData = {
  uid: string;
  name: string;
  size: number;
  playerUids: Set<string>;
  watcherUids: Set<String>;
};

export type UserDataMap = Map<string, UserData>;

export type RoomDataMap = Map<string, RoomData>;

export interface WebSocketReturn {
  userUid: string;
  roomUid?: string;
  onlineRooms: RoomDataMap;
  onlineUsers: UserDataMap;

  joinGameToWatch: (roomUid: string, response: StatusCallback) => void;
  joinGameToPlay: (roomUid: string, response: StatusCallback) => void;
  createGame: (response: StatusCallback) => void;
  leaveGame: (roomUid: string, response: StatusCallback) => void;

  listen: (event: EventName, handler: (...args: unknown[]) => void) => void;

  setRoomUid: (nextRoomUid?: string) => void;
}

const SOCKET_SERVER_URL = "http://localhost:4000";

const socket = io(SOCKET_SERVER_URL);

export function WebSocketProvider({ children }) {
  const [userUid, setUserUid] = useState<string>(
    undefined as unknown as string,
  );
  const [roomUid, setRoomUid] = useState<string | undefined>(undefined);
  const [onlineRooms, setOnlineRooms] = useState<RoomDataMap>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<UserDataMap>(new Map());

  useEffect(() => {
    function onConnected(nextUserUid: string): void {
      setUserUid(nextUserUid);
    }

    function onOnlineRoomsUpdate(nextOnlineRooms: RoomDataMap): void {
      setOnlineRooms(new Map(nextOnlineRooms));
    }

    function onOnlineUsersUpdate(nextOnlineUsers: UserDataMap): void {
      setOnlineUsers(new Map(nextOnlineUsers));
    }

    socket.off(EventName.Connected).on(EventName.Connected, onConnected);
    socket
      .off(EventName.OnlineRoomsUpdate)
      .on(EventName.OnlineRoomsUpdate, onOnlineRoomsUpdate);
    socket
      .off(EventName.OnlineUsersUpdate)
      .on(EventName.OnlineUsersUpdate, onOnlineUsersUpdate);
    socket
      .off(EventName.ConnectionWelcomeMessage)
      .on(EventName.ConnectionWelcomeMessage, toast);
    socket.off(EventName.LeavingGame).on(EventName.LeavingGame, toast);

    return () => {
      socket.off(EventName.Connected);
      socket.off(EventName.OnlineRoomsUpdate);
      socket.off(EventName.OnlineUsersUpdate);
    };
  }, []);

  useEffect(() => {
    if (!userUid) return;
    toast(`Connected to server as ${userUid}`);
  }, [userUid]);

  function joinGameToWatch(roomUid: string, callback: StatusCallback): void {
    socket.emit(EventName.JoinGameToWatch, roomUid, callback);
  }

  function joinGameToPlay(roomUid: string, callback: StatusCallback): void {
    socket.emit(EventName.JoinGameToPlay, roomUid, callback);
  }

  function createGame(callback: StatusCallback): void {
    socket.emit(EventName.CreateGame, callback);
  }

  function leaveGame(roomUid: string, callback: StatusCallback): void {
    if (!onlineUsers.get(userUid)?.roomUid) return;
    socket.emit(EventName.LeaveGame, roomUid, callback);
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
    <WebSocketContext.Provider
      value={{
        userUid,
        roomUid,
        onlineUsers,
        onlineRooms,

        joinGameToWatch,
        joinGameToPlay,
        createGame,
        leaveGame,

        listen,

        setRoomUid,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
