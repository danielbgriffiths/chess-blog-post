import {
  GameState,
  OnlineRoom as IOnlineRoom,
  Side,
  GameStatus,
} from "@chess-blog-post/common";

export class OnlineRoom implements IOnlineRoom {
  uid!: string;
  name!: string;
  size!: number;
  playerUids!: Set<string>;
  watcherUids!: Set<string>;
  gameState!: GameState;
  createdAt!: string;

  constructor(uid: string, userUid: string) {
    this.uid = uid;
    this.name = uid;
    this.size = 1;
    this.playerUids = new Set<string>([userUid]);
    this.watcherUids = new Set<string>();
    this.createdAt = new Date().toISOString();
    this.gameState = {
      white: undefined,
      black: undefined,
      turn: Side.White,
      status: GameStatus.Setup,
      whiteCaptures: [],
      blackCaptures: [],
      history: [],
    } as GameState;
  }

  public addWatcherToGame(userUid: string): boolean {
    this.watcherUids.add(userUid);
    this.size += 1;
    return this.watcherUids.has(userUid);
  }

  public addPlayerToGame(userUid: string): boolean {
    this.playerUids.add(userUid);
    this.size += 1;
    return this.playerUids.has(userUid);
  }

  public getPlayerUids(): Set<string> {
    return this.playerUids;
  }

  public getWatcherUids(): Set<string> {
    return this.watcherUids;
  }

  public isPlayer(userUid: string): boolean {
    return this.playerUids.has(userUid);
  }

  public isWatcher(userUid: string): boolean {
    return this.watcherUids.has(userUid);
  }

  public watcherUidsToSocket(): string[] {
    return Array.from(this.watcherUids);
  }

  public playerUidsToSocket(): string[] {
    return Array.from(this.playerUids);
  }

  public deletePlayerUid(userUid: string): boolean {
    this.playerUids.has(userUid);
    return this.playerUids.has(userUid);
  }

  public deleteWatcherUid(userUid: string): boolean {
    this.watcherUids.has(userUid);
    return this.watcherUids.has(userUid);
  }

  public updateSide(userUid: string, side: Side): void {
    this.gameState[side] = userUid;
  }

  public updateGameState(nextGameState: GameState): void {
    this.gameState = nextGameState;
  }

  public toSummarySocket(): Pick<
    IOnlineRoom,
    "uid" | "name" | "size" | "createdAt"
  > {
    return {
      uid: this.uid,
      name: this.name,
      size: this.size,
      createdAt: this.createdAt,
    };
  }

  public toSocket(): any {
    return {
      uid: this.uid,
      name: this.name,
      size: this.size,
      createdAt: this.createdAt,
      watcherUids: this.watcherUidsToSocket(),
      playerUids: this.playerUidsToSocket(),
      gameState: this.gameState,
    };
  }
}

export class OnlineRooms {
  private data!: Map<string, OnlineRoom>;

  constructor() {
    this.data = new Map<string, OnlineRoom>();
  }

  public getRoomUid(userUid: string): string {
    return `room::${userUid}`;
  }

  public create(uid: string, userUid: string): OnlineRoom {
    const newRoom = new OnlineRoom(uid, userUid);
    const newSet = this.set(uid, newRoom);
    return newSet.get(uid)!;
  }

  public get(uid: string): OnlineRoom {
    return this.data.get(uid)!;
  }

  public has(uid: string): boolean {
    return this.data.has(uid);
  }

  public set(uid: string, data: OnlineRoom): Map<string, OnlineRoom> {
    return this.data.set(uid, data);
  }

  public toSocket(): any {
    return Array.from(this.data.entries()).map((entry) => [
      entry[0],
      entry[1].toSummarySocket(),
    ]);
  }
}
