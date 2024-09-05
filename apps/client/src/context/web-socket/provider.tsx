import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";
import {
  Side,
  GameState,
  StatusCallback,
  EventName,
  OnlineUser,
  OnlineRoom,
  RawRoomData,
} from "@chess-blog-post/common";

import { WebSocketContext } from "./create-context";

export type OnlineRoomMap = Map<string, OnlineRoom>;

export type OnlineUserMap = Map<string, OnlineUser>;

export interface WebSocketReturn {
  userUid: string;
  room?: OnlineRoom;
  onlineRooms: OnlineRoomMap;
  onlineUsers: OnlineUserMap;

  joinGameToWatch: (roomUid: string, response: StatusCallback) => void;
  joinGameToPlay: (roomUid: string, response: StatusCallback) => void;
  createGame: (response: StatusCallback) => void;
  leaveGame: (response: StatusCallback) => void;
  clickCellToMove: (nextGameState: GameState, response: StatusCallback) => void;
  selectSide: (selectedSide: Side, callback: StatusCallback) => void;

  listen: (event: EventName, handler: (...args: unknown[]) => void) => void;

  onRoomDataUpdate: (nextRoom?: RawRoomData) => void;
}

const SOCKET_SERVER_URL = "http://localhost:3000";

const socket = io(SOCKET_SERVER_URL);

export function WebSocketProvider({ children }: PropsWithChildren) {
  const [userUid, setUserUid] = useState<string>(
    undefined as unknown as string,
  );
  const [room, setRoom] = useState<OnlineRoom | undefined>(undefined);
  const [onlineRooms, setOnlineRooms] = useState<OnlineRoomMap>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserMap>(new Map());

  useEffect(() => {
    function onConnected(nextUserUid: string): void {
      setUserUid(nextUserUid);
    }

    function onOnlineRoomsUpdate(nextOnlineRooms: OnlineRoomMap): void {
      setOnlineRooms(new Map(nextOnlineRooms));
    }

    function onOnlineUsersUpdate(nextOnlineUsers: OnlineUserMap): void {
      setOnlineUsers(new Map(nextOnlineUsers));
    }

    function onPlayerJoinedGame(playerUid: string): void {
      toast(`${playerUid} joined game!`);
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
    socket
      .off(EventName.PlayerJoinedGame)
      .on(EventName.PlayerJoinedGame, onPlayerJoinedGame);
    socket
      .off(EventName.RoomDataUpdate)
      .on(EventName.RoomDataUpdate, onRoomDataUpdate);

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

  function onRoomDataUpdate(nextRoomData?: RawRoomData): void {
    setRoom(() => {
      if (!nextRoomData) return undefined;

      return {
        uid: nextRoomData.uid,
        name: nextRoomData.name,
        size: nextRoomData.size,
        createdAt: nextRoomData.createdAt,
        gameState: nextRoomData.gameState,
        playerUids: new Set(nextRoomData.playerUids),
        watcherUids: new Set(nextRoomData.watcherUids),
      };
    });
  }

  function joinGameToWatch(roomUid: string, callback: StatusCallback): void {
    socket.emit(EventName.JoinGameToWatch, roomUid, callback);
  }

  function joinGameToPlay(roomUid: string, callback: StatusCallback): void {
    socket.emit(EventName.JoinGameToPlay, roomUid, callback);
  }

  function createGame(callback: StatusCallback): void {
    socket.emit(EventName.CreateGame, callback);
  }

  function leaveGame(callback: StatusCallback): void {
    socket.emit(EventName.LeaveGame, callback);
  }

  function clickCellToMove(
    nextGameState: GameState,
    callback: StatusCallback,
  ): void {
    socket.emit(EventName.ClickCellToMove, nextGameState, callback);
  }

  function selectSide(selectedSide: Side, callback: StatusCallback): void {
    socket.emit(EventName.SelectSide, selectedSide, callback);
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
        room,
        onlineUsers,
        onlineRooms,

        joinGameToWatch,
        joinGameToPlay,
        createGame,
        leaveGame,
        clickCellToMove,
        selectSide,

        listen,

        onRoomDataUpdate,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
