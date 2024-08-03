import { Server } from "socket.io";

enum EventName {
  Connected = "connected",
  ConnectionWelcomeMessage = "connection-welcome-message",
  JoinGameToWatch = "join-game-to-watch",
  JoinGameToPlay = "join-game-to-play",
  CreateGame = "create-game",
  LeaveGame = "leave-game",
  PlayerLeftGame = "player-left-game",
  LeavingGame = "leaving-game",
  OnlineRoomsUpdate = "online-rooms-update",
  OnlineUsersUpdate = "online-users-update",
}

enum UserStatus {
  Waiting,
  Pending,
  PairedPlayer,
  PairedWatcher,
}

type UserData = {
  uid: string;
  username: string;
  status: UserStatus;
  createdAt: string;
  wins: number;
  losses: number;
  roomUid?: string;
};

type RoomData = {
  uid: string;
  name: string;
  size: number;
  playerUids: Set<string>;
  watcherUids: Set<string>;
};

type UserDataMap = Map<string, UserData>;

type RoomDataMap = Map<string, RoomData>;

const io: Server = require("socket.io")(4000, {
  cors: {
    origin: "*",
  },
});

const CONNECTION = "connection";
const DISCONNECT = "disconnect";
const WAITING_ROOM = "waitingRoom";

const onlineUsers: UserDataMap = new Map<string, UserData>();
const onlineRooms: RoomDataMap = new Map<string, RoomData>();

function getOnlineRooms() {}

function getOnlineUsers() {}

io.on(CONNECTION, (socket): void => {
  console.info("New client connected");

  socket.emit(EventName.Connected, socket.id);

  const userData = onlineUsers.get(socket.id)!;
  onlineUsers.set(socket.id, {
    uid: userData?.uid ?? socket.id,
    username: userData?.username ?? socket.id,
    status: userData?.status ?? UserStatus.Waiting,
    createdAt: userData?.createdAt ?? new Date().toISOString(),
    wins: userData?.wins ?? 0,
    losses: userData?.losses ?? 0,
    roomUid: userData?.roomUid ?? undefined,
  });

  io.emit(
    EventName.OnlineRoomsUpdate,
    Array.from(onlineRooms.entries()).map((entry) => {
      return [
        entry[0],
        {
          ...entry[1],
          watcherUids: Array.from(entry[1].watcherUids),
          playerUids: Array.from(entry[1].playerUids),
        },
      ];
    }) as any,
  );
  io.emit(
    EventName.OnlineUsersUpdate,
    Array.from(onlineUsers.entries()) as any,
  );

  socket.broadcast.emit(
    EventName.ConnectionWelcomeMessage,
    `A new user, ${socket.id}, has entered the server`,
  );

  socket.on(EventName.JoinGameToWatch, (roomUid: string, callback): void => {
    const userData = onlineUsers.get(socket.id)!;
    const roomData = onlineRooms.get(roomUid)!;

    if (userData.roomUid) {
      callback({ status: "failed", roomUid, joinType: "watcher" });
      return;
    }

    socket.join(roomUid);

    onlineRooms.set(roomUid, {
      ...roomData,
      size: roomData.size + 1,
      watcherUids: roomData.watcherUids.add(socket.id),
    });
    onlineUsers.set(socket.id, {
      ...userData,
      roomUid,
      status: UserStatus.PairedWatcher,
    });

    io.emit(
      EventName.OnlineRoomsUpdate,
      Array.from(onlineRooms.entries()).map((entry) => {
        return [
          entry[0],
          {
            ...entry[1],
            watcherUids: Array.from(entry[1].watcherUids),
            playerUids: Array.from(entry[1].playerUids),
          },
        ];
      }) as any,
    );
    io.emit(
      EventName.OnlineUsersUpdate,
      Array.from(onlineUsers.entries()) as any,
    );

    callback({ status: "success", roomUid, joinType: "watcher" });
  });

  socket.on(EventName.JoinGameToPlay, (roomUid: string, callback): void => {
    const userData = onlineUsers.get(socket.id)!;
    const roomData = onlineRooms.get(roomUid)!;

    if (userData.roomUid) {
      callback({ status: "failed", roomUid, joinType: "player" });
      return;
    }

    socket.join(roomUid);

    onlineRooms.set(roomUid, {
      ...roomData,
      size: roomData.size + 1,
      playerUids: roomData.playerUids.add(socket.id),
    });

    for (const playerUid of roomData.playerUids) {
      const playerData = onlineUsers.get(playerUid)!;
      onlineUsers.set(playerUid, {
        ...playerData,
        roomUid,
        status: UserStatus.PairedPlayer,
      });
    }

    io.emit(
      EventName.OnlineRoomsUpdate,
      Array.from(onlineRooms.entries()).map((entry) => {
        return [
          entry[0],
          {
            ...entry[1],
            watcherUids: Array.from(entry[1].watcherUids),
            playerUids: Array.from(entry[1].playerUids),
          },
        ];
      }) as any,
    );
    io.emit(
      EventName.OnlineUsersUpdate,
      Array.from(onlineUsers.entries()) as any,
    );

    callback({ status: "success", roomUid, joinType: "player" });
  });

  socket.on(EventName.CreateGame, (callback): void => {
    const newGameRoomUid = `game-room:${socket.id}`;

    const userData = onlineUsers.get(socket.id)!;

    if (userData.roomUid) {
      callback({ status: "failed" });
      return;
    }

    socket.join(newGameRoomUid);

    onlineRooms.set(newGameRoomUid, {
      uid: newGameRoomUid,
      name: newGameRoomUid,
      size: 1,
      playerUids: new Set([socket.id]),
      watcherUids: new Set(),
    });
    onlineUsers.set(socket.id, {
      ...userData,
      roomUid: newGameRoomUid,
      status: UserStatus.Pending,
    });

    io.emit(
      EventName.OnlineRoomsUpdate,
      Array.from(onlineRooms.entries()).map((entry) => {
        return [
          entry[0],
          {
            ...entry[1],
            watcherUids: Array.from(entry[1].watcherUids),
            playerUids: Array.from(entry[1].playerUids),
          },
        ];
      }) as any,
    );
    io.emit(
      EventName.OnlineUsersUpdate,
      Array.from(onlineUsers.entries()) as any,
    );

    callback({ status: "success", roomUid: newGameRoomUid });
  });

  socket.on(EventName.LeaveGame, (roomUid: string, callback): void => {
    const roomData = onlineRooms.get(roomUid)!;

    const isPlayer = roomData.playerUids.has(socket.id);
    const isWatcher = roomData.watcherUids.has(socket.id);

    io.to(roomUid).emit(
      EventName.LeavingGame,
      `${socket.id} stopped ${isPlayer ? "playing" : isWatcher ? "watching" : ""} game` as string,
    );

    socket.leave(roomUid);

    io.to(roomUid).emit(
      EventName.PlayerLeftGame,
      Array.from(roomData.watcherUids),
    );

    if (isPlayer) {
      onlineUsers.set(socket.id, {
        ...onlineUsers.get(socket.id)!,
        roomUid: undefined,
        status: UserStatus.Waiting,
      });
      roomData.playerUids.delete(socket.id);

      for (const watcherUid of roomData.watcherUids) {
        onlineUsers.set(watcherUid, {
          ...onlineUsers.get(watcherUid)!,
          roomUid: undefined,
          status: UserStatus.Waiting,
        });
        roomData.watcherUids.delete(watcherUid);
      }

      for (const playerUid of roomData.playerUids) {
        onlineUsers.set(playerUid, {
          ...onlineUsers.get(playerUid)!,
          status: UserStatus.Pending,
        });
      }
    } else if (isWatcher) {
      onlineUsers.set(socket.id, {
        ...onlineUsers.get(socket.id)!,
        roomUid: undefined,
        status: UserStatus.Waiting,
      });
      roomData.watcherUids.delete(socket.id);
    }

    io.emit(
      EventName.OnlineRoomsUpdate,
      Array.from(onlineRooms.entries()).map((entry) => {
        return [
          entry[0],
          {
            ...entry[1],
            watcherUids: Array.from(entry[1].watcherUids),
            playerUids: Array.from(entry[1].playerUids),
          },
        ];
      }) as any,
    );
    io.emit(
      EventName.OnlineUsersUpdate,
      Array.from(onlineUsers.entries()) as any,
    );

    callback({ status: "success" });
  });

  socket.on(DISCONNECT, () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});
