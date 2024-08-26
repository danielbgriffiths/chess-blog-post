import { createWebSocketServer } from "./web-socket/server";
import { createHTTPServer } from "./http/server";
import { OnlineUsers } from "./models/online-user";
import { OnlineRooms } from "./models/online-room";

const onlineUsers = new OnlineUsers();
const onlineRooms = new OnlineRooms();

const httpServer = createHTTPServer();
createWebSocketServer(httpServer, onlineUsers, onlineRooms);
