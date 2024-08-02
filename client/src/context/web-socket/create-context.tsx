import { createContext } from "react";

import { WebSocketReturn } from "./provider.tsx";

export const WebsocketContext = createContext<WebSocketReturn>(
  {} as WebSocketReturn,
);
