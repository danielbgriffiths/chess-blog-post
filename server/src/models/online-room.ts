import { OnlineRoom as IOnlineRoom, OnlineRoomMap, RoomStatus } from "../types";

export class OnlineRoom implements IOnlineRoom {
  uid!: string;
  username!: string;
  status!: RoomStatus;
  createdAt!: string;
  wins!: number;
  losses!: number;
  roomUid?: string;

  constructor(uid: string) {
    this.uid = uid;
    this.username = uid;
    this.status = RoomStatus.Waiting;
    this.createdAt = new Date().toISOString();
    this.wins = 0;
    this.losses = 0;
    this.roomUid = undefined;
  }
}

export class OnlineRooms {
  data!: OnlineRoomMap;

  constructor() {
    this.data = new Map<string, OnlineRoom>();
  }

  get(uid: string): OnlineRoom {
    return this.data.get(uid);
  }

  set(uid: string, data: Partial<OnlineRoom>): void {
    this.data.set(uid, {
      ...this.data.get(uid)!,
      ...data,
    });
  }

  toSocket(): any {
    return Array.from(this.data.entries());
  }
}
