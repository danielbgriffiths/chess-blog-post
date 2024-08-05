import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { BoardProvider } from "../../context/board/provider";
import { ChessGame } from "./components/chess-game";
import { useWebSocket } from "../../context/web-socket/use-context";
import { EventName } from "../../context/web-socket/provider";

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
    toast(`Leaving ${websocket.room!.uid} game`);
    websocket.leaveGame((response) => {
      if (response.status !== "success") return;
      websocket.setRoom(undefined);
      navigate("/");
    });
  }

  websocket.listen(EventName.PlayerLeftGame, (watcherUids) => {
    if (!watcherUids.includes(websocket.userUid)) return;
    websocket.setRoom(undefined);
    navigate("/");
  });

  if (!hasUserInRoom()) {
    return <div>User not recognized in room!</div>;
  }

  return (
    <BoardProvider>
      <ChessGame onLeaveGame={onLeaveGame} />
    </BoardProvider>
  );
}
