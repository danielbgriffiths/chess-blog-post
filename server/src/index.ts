import { createWebSocketServer } from "./web-socket/server";
import { OnlineUsers } from "./models/online-user";
import { OnlineRooms } from "./models/online-room";

const onlineUsers = new OnlineUsers();
const onlineRooms = new OnlineRooms();

createWebSocketServer(onlineUsers, onlineRooms);
