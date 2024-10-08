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
  RoomDataUpdate = "room-data-update",
  SelectSide = "select-side",
  ClickCellToMove = "click-cell-to-move",
  CellClickedWithMove = "cell-clicked-with-move",
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
  timestamp: string;
  piece: Piece;
  from: string;
  to: string;
  turn: Side;
  capture?: Piece;
  fromCheck: boolean;
  toCheck: boolean;
  toCheckMate: boolean;
}

export enum GameStatus {
  Setup,
  Ready,
  InProgress,
  Paused,
  Ended,
}

export interface GameState {
  white?: string;
  black?: string;
  turn?: Side;
  status: GameStatus;
  whiteCaptures: Piece[];
  blackCaptures: Piece[];
  history: HistoryRecord[];
}

export interface OnlineUser {
  uid: string;
  username: string;
  status: UserStatus;
  createdAt: string;
  wins: number;
  losses: number;
  roomUid?: string;
}

export interface OnlineRoom {
  uid: string;
  name: string;
  size: number;
  createdAt: string;
  playerUids: Set<string>;
  watcherUids: Set<string>;
  gameState: GameState;
}

export type OnlineRoomOverview = Pick<
  OnlineRoom,
  "uid" | "name" | "size" | "createdAt"
>;

export type RawRoomData = Omit<OnlineRoom, "playerUids" | "watcherUids"> & {
  playerUids: string[];
  watcherUids: string[];
};

export interface StatusCallbackPayload {
  status: string;
  [key: string]: unknown;
}

export type StatusCallback = (response: StatusCallbackPayload) => void;
