import { useContext } from "react";

import { WebSocketReturn } from "./provider.tsx";
import { WebsocketContext } from "./create-context.tsx";

export function useWebSocket(): WebSocketReturn {
  return useContext(WebsocketContext);
}
