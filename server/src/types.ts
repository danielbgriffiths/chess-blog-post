export enum EventName {
  Connected = "connected",
  ConnectionWelcomeMessage = "connection-welcome-message",
  JoinGameToWatch = "join-game-to-watch",
  JoinGameToPlay = "join-game-to-play",
  CreateGame = "create-game",
  LeaveGame = "leave-game",
  PlayerLeftGame = "player-left-game",
  PlayerJoinedGame = "player-joined-game",
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

export enum Piece {
  Queen,
  King,
  Bishop,
  Knight,
  Rook,
  Pawn,
}

export enum Side {
  White = "white",
  Black = "black",
}

export interface HistoryRecord {
  piece: Piece;
  from: string;
  to: string;
  turn: Side;
}

export interface GameState {
  white?: string;
  black?: string;
  turn?: Side;
  whiteCaptures: Piece[];
  blackCaptures: Piece[];
  history: HistoryRecord[];
}

export type OnlineUser = {
  uid: string;
  username: string;
  status: UserStatus;
  createdAt: string;
  wins: number;
  losses: number;
  roomUid?: string;
};

export interface OnlineRoom {
  uid: string;
  name: string;
  size: number;
}

export type RoomData = OnlineRoom & {
  playerUids: Set<string>;
  watcherUids: Set<string>;
  gameState: GameState;
};

export type OnlineUserMap = Map<string, OnlineUser>;

export type OnlineRoomMap = Map<string, OnlineRoom>;

export interface CompositionsReturn {
  connection: () => void;
  joinGameToWatch: (roomUid: string, callback: unknown) => void;
  joinGameToPlay: (roomUid: string, callback: unknown) => void;
  createGame: (callback: unknown) => void;
  leaveGame: (roomUid: string, callback: unknown) => void;
  disconnect: () => void;
}
