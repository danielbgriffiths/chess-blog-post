import { OnlineUser as IOnlineUser, OnlineUserMap, UserStatus } from "../types";

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
}

export class OnlineUsers {
  data!: OnlineUserMap;

  constructor() {
    this.data = new Map<string, OnlineUser>();
  }

  get(uid: string): OnlineUser {
    return this.data.get(uid);
  }

  set(uid: string, data: Partial<OnlineUser>): void {
    this.data.set(uid, {
      ...this.data.get(uid)!,
      ...data,
    });
  }

  toSocket(): any {
    return Array.from(this.data.entries());
  }
}
