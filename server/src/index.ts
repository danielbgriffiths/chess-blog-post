import { Server } from "socket.io";

const io: Server = require("socket.io")(4000, {
  cors: {
    origin: "*",
  },
});

const CONNECTION = "connection";
const DISCONNECT = "disconnect";
const WAITING_ROOM = "waitingRoom";

io.on(CONNECTION, (socket): void => {
  console.info("New client connected");
});
