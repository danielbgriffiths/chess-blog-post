import { useContext } from "react";

import { WebSocketReturn } from "./provider";
import { WebSocketContext } from "./create-context";

export function useWebSocket(): WebSocketReturn {
  return useContext(WebSocketContext);
}
