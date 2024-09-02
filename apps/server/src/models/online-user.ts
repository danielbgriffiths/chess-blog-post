import { OnlineUser as IOnlineUser, UserStatus } from "@chess-blog-post/common";

export class OnlineUser implements IOnlineUser {
  uid!: string;
  username!: string;
  status!: UserStatus;
  createdAt!: string;
  wins!: number;
  losses!: number;
  roomUid?: string;

  constructor(uid: string) {
    this.uid = uid;
    this.username = uid;
    this.status = UserStatus.Waiting;
    this.createdAt = new Date().toISOString();
    this.wins = 0;
    this.losses = 0;
    this.roomUid = undefined;
  }

  isInRoom(): boolean {
    return !!this.roomUid;
  }

  public getRoomUid(): string | undefined {
    return this.roomUid;
  }

  public addRoom(roomUid: string): boolean {
    this.roomUid = roomUid;
    return true;
  }

  public updateStatusPairedAsPlayer(): boolean {
    if (!this.roomUid) return false;
    this.status = UserStatus.PairedPlayer;
    return true;
  }

  public updateStatusPairedAsWatcher(): boolean {
    if (!this.roomUid) return false;
    this.status = UserStatus.PairedWatcher;
    return true;
  }

  public updateStatusPending(): boolean {
    if (!this.roomUid) return false;
    this.status = UserStatus.Pending;
    return true;
  }

  public updateStatusWaiting(): boolean {
    if (!this.roomUid) return false;
    this.status = UserStatus.Waiting;
    this.roomUid = undefined;
    return true;
  }
}

export class OnlineUsers {
  private data!: Map<string, OnlineUser>;

  constructor() {
    this.data = new Map<string, OnlineUser>();
  }

  public has(uid: string): boolean {
    return this.data.has(uid);
  }

  public get(uid: string): OnlineUser {
    return this.data.get(uid)!;
  }

  public set(uid: string, data: OnlineUser): void {
    this.data.set(uid, data);
  }

  public toSocket(): any {
    return Array.from(this.data.entries());
  }

  public create(uid: string): OnlineUser {
    if (this.has(uid)) return this.get(uid)!;
    const newUser = new OnlineUser(uid);
    this.set(uid, newUser);
    return newUser;
  }
}
