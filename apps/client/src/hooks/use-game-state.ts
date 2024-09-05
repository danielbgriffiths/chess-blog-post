import { useCallback, useMemo } from "react";
import {
  EventName,
  StatusCallback,
  GameStatus,
  Side,
  HistoryRecord,
  GameState,
  RawRoomData,
  Piece,
} from "@chess-blog-post/common";

import { useWebSocket } from "../context/web-socket/use-context";

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
  whiteCaptures: Piece[];
  blackCaptures: Piece[];
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

  const whiteUid = useMemo<string | undefined>(() => {
    return websocket.room?.gameState.white;
  }, [websocket.room]);

  const blackUid = useMemo<string | undefined>(() => {
    return websocket.room?.gameState.black;
  }, [websocket.room]);

  const turnUid = useMemo<string | undefined>(() => {
    return turn === Side.White ? whiteUid : blackUid;
  }, [turn]);

  const status = useMemo<GameStatus>(() => {
    return websocket.room?.gameState.status!;
  }, [websocket.room]);

  const whiteCaptures = useMemo<Piece[]>(
    () => websocket.room?.gameState.whiteCaptures ?? [],
    [websocket.room],
  );

  const blackCaptures = useMemo<Piece[]>(
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
          websocket.onRoomDataUpdate(response.room as RawRoomData);
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
          websocket.onRoomDataUpdate(response.room as RawRoomData);
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
          websocket.onRoomDataUpdate(response.room as RawRoomData);
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
