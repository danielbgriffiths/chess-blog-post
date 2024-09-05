import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { EventName } from "@chess-blog-post/common";

import { BoardProvider } from "../../context/board/provider";
import { ChessGame } from "./components/chess-game";
import { useWebSocket } from "../../context/web-socket/use-context";

export function GameSpace() {
  const navigate = useNavigate();
  const websocket = useWebSocket();

  function hasUserInRoom(): boolean {
    if (!websocket.userUid) return false;
    const roomUid = websocket.onlineUsers.get(websocket.userUid)?.roomUid;
    if (!roomUid) return false;
    return websocket.onlineRooms.has(roomUid);
  }

  function onLeaveGame(): void {
    toast(`Leaving ${websocket.room!.uid} game`);
    websocket.leaveGame((response): void => {
      if (response.status !== "success") return;
      websocket.onRoomDataUpdate(undefined);
      navigate("/");
    });
  }

  websocket.listen(EventName.PlayerLeftGame, (watcherUids): void => {
    if (!(watcherUids as string[]).includes(websocket.userUid)) return;
    websocket.onRoomDataUpdate(undefined);
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
