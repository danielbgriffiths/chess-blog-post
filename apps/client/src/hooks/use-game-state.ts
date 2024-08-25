import { useCallback, useMemo } from "react";

import { useWebSocket } from "../context/web-socket/use-context";
import {
  EventName,
  RoomData,
  StatusCallback,
} from "../context/web-socket/provider";

export enum Piece {
  Queen,
  King,
  Bishop,
  Knight,
  Rook,
  Pawn,
}

export enum GameStatus {
  Setup,
  Ready,
  InProgress,
  Paused,
  Ended,
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

export interface GameState {
  white?: string;
  black?: string;
  turn: Side;
  status: GameStatus;
  whiteCaptures: HistoryRecord[];
  blackCaptures: HistoryRecord[];
  history: HistoryRecord[];
}

export interface GameStateReturn {
  isWatcher: boolean;
  whiteUid?: string;
  blackUid?: string;
  status: GameStatus;
  turn: Side;
  turnUid?: string;
  isOpponentWhite: boolean;
  isOpponentBlack: boolean;
  isUserWhite: boolean;
  isUserBlack: boolean;
  isUsersTurn: boolean;
  whiteCaptures: HistoryRecord[];
  blackCaptures: HistoryRecord[];
  history: HistoryRecord[];

  canInteractWithCell: (cellUid: string) => boolean;

  createGame: (
    successCallback: StatusCallback,
    errorCallback: StatusCallback,
  ) => void;
  joinGameToPlay: (
    roomUid: string,
    successCallback: StatusCallback,
    errorCallback: StatusCallback,
  ) => void;
  joinGameToWatch: (
    roomUid: string,
    successCallback: StatusCallback,
    errorCallback: StatusCallback,
  ) => void;
  selectSide: (side: Side, errorCallback: StatusCallback) => void;
  clickCellToMove: (
    nextGameState: GameState,
    onSuccess: StatusCallback,
    onFail: StatusCallback,
  ) => void;
  cellClickedWithMove: (onSuccess: any) => void;
}

export function useGameState(): GameStateReturn {
  const websocket = useWebSocket();

  const isWatcher = useMemo(() => {
    return websocket.room?.watcherUids.has(websocket.userUid) ?? false;
  }, [websocket.room, websocket.userUid]);

  const turn = useMemo<Side>(() => {
    return websocket.room?.gameState.turn!;
  }, [websocket.room]);

  const turnUid = useMemo<string | undefined>(() => {
    return turn === Side.White ? whiteUid : blackUid;
  }, [turn]);

  const whiteUid = useMemo<string | undefined>(() => {
    return websocket.room?.gameState.white;
  }, [websocket.room]);

  const blackUid = useMemo<string | undefined>(() => {
    return websocket.room?.gameState.black;
  }, [websocket.room]);

  const status = useMemo<GameStatus>(() => {
    return websocket.room?.gameState.status!;
  }, [websocket.room]);

  const whiteCaptures = useMemo<HistoryRecord[]>(
    () => websocket.room?.gameState.whiteCaptures ?? [],
    [websocket.room],
  );

  const blackCaptures = useMemo<HistoryRecord[]>(
    () => websocket.room?.gameState.blackCaptures ?? [],
    [websocket.room],
  );

  const history = useMemo<HistoryRecord[]>(
    () => websocket.room?.gameState.history ?? [],
    [websocket.room],
  );

  const isOpponentWhite = !!whiteUid && whiteUid !== websocket.userUid;
  const isOpponentBlack = !!blackUid && blackUid !== websocket.userUid;
  const isUserWhite = whiteUid === websocket.userUid;
  const isUserBlack = blackUid === websocket.userUid;
  const isUsersTurn = turnUid === websocket.userUid;

  function canInteractWithCell(_cellUid: string): boolean {
    return turnUid !== websocket.userUid;
  }

  function createGame(
    successCallback: StatusCallback,
    errorCallback: StatusCallback,
  ): void {
    websocket.createGame((response) => {
      switch (response.status) {
        case "success":
          websocket.setRoom(response.room as RoomData);
          successCallback(response);
          break;
        default:
          errorCallback(response);
          break;
      }
    });
  }

  function joinGameToPlay(
    roomUid: string,
    successCallback: StatusCallback,
    errorCallback: StatusCallback,
  ): void {
    websocket.joinGameToPlay(roomUid, (response) => {
      switch (response.status) {
        case "success":
          websocket.setRoom(response.room as RoomData);
          successCallback(response);
          break;
        default:
          errorCallback(response);
          break;
      }
    });
  }

  function joinGameToWatch(
    roomUid: string,
    successCallback: StatusCallback,
    errorCallback: StatusCallback,
  ): void {
    websocket.joinGameToWatch(roomUid, (response) => {
      switch (response.status) {
        case "success":
          websocket.setRoom(response.room as RoomData);
          successCallback(response);
          break;
        default:
          errorCallback(response);
          break;
      }
    });
  }

  function selectSide(side: Side, errorCallback: StatusCallback): void {
    websocket.selectSide(side, (response): void => {
      switch (response.status) {
        case "success":
          break;
        default:
          errorCallback(response);
          break;
      }
    });
  }

  function clickCellToMove(
    nextGameState: GameState,
    onSuccess: StatusCallback,
    onFail: StatusCallback,
  ): void {
    websocket.clickCellToMove(nextGameState, (response) => {
      if (response.status === "failed") {
        return onFail(response);
      }

      return onSuccess(response);
    });
  }

  const cellClickedWithMove = useCallback(
    (onSuccess: (...args: unknown[]) => unknown): void => {
      websocket.listen(EventName.CellClickedWithMove, onSuccess);
    },
    [websocket.userUid],
  );

  return {
    isWatcher,
    whiteUid,
    blackUid,
    status,
    turn,
    turnUid,
    isOpponentWhite,
    isOpponentBlack,
    isUserWhite,
    isUserBlack,
    isUsersTurn,
    whiteCaptures,
    blackCaptures,
    history,

    canInteractWithCell,

    createGame,
    joinGameToPlay,
    joinGameToWatch,
    selectSide,
    clickCellToMove,
    cellClickedWithMove,
  };
}
