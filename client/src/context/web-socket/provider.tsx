import { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";

export enum WsEmit {
  Join = "join",
  ReJoin = "rejoin",
  JoinRoom = "join-room",
  LeaveRoom = "leave-room",
}

export enum WsListen {
  JoinSuccess = "join-success",
  JoinFailed = "join-failed",
  Connected = "connect",
  RoomJoined = "room-joined",
  RoomFull = "room-full",
  RoomLeft = "room-left",
  RoomsUpdate = "rooms-update",
  UsersUpdate = "users-update",
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
  roomName?: string;
  roomUid?: string;
};

export type RoomData = {
  name: string;
  size: number;
  clients?: string[];
};

interface WebSocketReturn {
  isConnected: boolean;
  isJoined: boolean;
  allRooms: RoomData[];
  allUsers: UserData[];
  currentRoomName: string;
  username: string;
  joinRoom: (nextRoom: string) => void;
  createAndJoinRoom: (newRoomName: string) => void;
  leaveRoom: () => void;
  join: (username: string) => void;
  setIsJoined: (nextIsJoined: boolean) => void;
  setUsername: (nextUsername: string) => void;
  listen: (event: WsListen, handler: (...args: unknown[]) => void) => void;
}

const SOCKET_SERVER_URL = "http://localhost:4000";
const WAITING_ROOM = "waitingRoom";

const socket = io(SOCKET_SERVER_URL);

export function WebSocketProvider({ children }) {
  const [allRooms, setAllRooms] = useState<RoomData[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentRoomName, setCurrentRoomName] = useState<string>(WAITING_ROOM);
  const [username, setUsername] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);

  useEffect(() => {
    function onConnect(): void {
      setIsConnected(true);

      const storedUsername = localStorage.getItem("chess::username");
      if (!storedUsername) return;
      socket.emit(WsEmit.ReJoin, storedUsername);
      setUsername(storedUsername);
      setCurrentRoomName(WAITING_ROOM);
      setIsJoined(true);
    }

    socket.off(WsListen.Connected).on(WsListen.Connected, onConnect);

    if (!isJoined) return;

    function onRoomJoined(nextRoomName: string): void {
      setCurrentRoomName(nextRoomName);
      if (nextRoomName === WAITING_ROOM) return;
      toast(`Joined server's ${nextRoomName}`);
    }

    function onRoomFull(invalidRoomName: string): void {
      toast(`${invalidRoomName} room is full`);
    }

    function onRoomLeft(roomName: string): void {
      setCurrentRoomName(WAITING_ROOM);
      toast(`Left ${roomName} room`);
    }

    function onRoomsUpdate(nextRooms: RoomData[]): void {
      setAllRooms(nextRooms);
    }

    function onUsersUpdate(nextUsers: UserData[]): void {
      setAllUsers(nextUsers);
    }

    socket.off(WsListen.RoomJoined).on(WsListen.RoomJoined, onRoomJoined);
    socket.off(WsListen.RoomFull).on(WsListen.RoomFull, onRoomFull);
    socket.off(WsListen.RoomLeft).on(WsListen.RoomLeft, onRoomLeft);
    socket.off(WsListen.RoomsUpdate).on(WsListen.RoomsUpdate, onRoomsUpdate);
    socket.off(WsListen.UsersUpdate).on(WsListen.UsersUpdate, onUsersUpdate);

    return () => {
      socket.off(WsListen.Connected);
      socket.off(WsListen.RoomJoined);
      socket.off(WsListen.RoomFull);
      socket.off(WsListen.RoomLeft);
      socket.off(WsListen.RoomsUpdate);
      socket.off(WsListen.UsersUpdate);
    };
  }, [isJoined]);

  function join(username: string): void {
    socket.emit(WsEmit.Join, username);
    setIsJoined(true);
    setUsername(username);
  }

  function joinRoom(room: string): void {
    socket.emit(WsEmit.JoinRoom, room);
  }

  function createAndJoinRoom(newRoomName: string): void {
    if (newRoomName.trim() === "") return;
    socket.emit(WsEmit.JoinRoom, newRoomName);
  }

  function leaveRoom(): void {
    if (currentRoomName === WAITING_ROOM) return;
    socket.emit(WsEmit.LeaveRoom, currentRoomName);
  }

  const listen = useCallback(
    (event: WsListen, handler: (...args: unknown[]) => void) => {
      if (!socket) return;

      socket.off(event).on(event, handler);

      return (): void => {
        socket.off(event);
      };
    },
    [isConnected],
  );

  return (
    <Websocket.Provider
      value={{
        isConnected,
        isJoined,
        allRooms,
        allUsers,
        currentRoomName,
        username,
        joinRoom,
        createAndJoinRoom,
        leaveRoom,
        join,
        setIsJoined,
        setUsername,
        listen,
      }}
    >
      {children}
    </Websocket.Provider>
  );
}
