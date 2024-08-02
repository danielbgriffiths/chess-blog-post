import { useNavigate } from "react-router-dom";

import { GameProvider } from "../../context/game/provider";
import { ChessGame } from "./components/chess-game";
import { useWebSocket } from "../../context/web-socket/use-context";
import { toast } from "react-toastify";

export function GameSpace() {
  const navigate = useNavigate();
  const websocket = useWebSocket();

  function hasUserInRoom(): boolean {
    if (!websocket.userUid) return false;
    const roomUid = websocket.onlineUsers.get(websocket.userUid).roomUid;
    if (!roomUid) return false;
    return websocket.onlineRooms.has(roomUid);
  }

  function onLeaveGame(): void {
    toast(`Leaving ${websocket.roomUid} game`);
    websocket.leaveGame();
    navigate("/");
  }

  if (hasUserInRoom()) {
    return <div>No user recognized.</div>;
  }

  return (
    <GameProvider onLeaveGame={onLeaveGame}>
      <ChessGame />
    </GameProvider>
  );
}
