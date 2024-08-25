import { createContext } from "react";

import { WebSocketReturn } from "./provider";

export const WebSocketContext = createContext<WebSocketReturn>(
  {} as WebSocketReturn,
);
