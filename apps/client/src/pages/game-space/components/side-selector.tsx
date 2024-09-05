import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Side } from "@chess-blog-post/common";

import { useGameState } from "../../../hooks/use-game-state";

export function SideSelector() {
  const gameState = useGameState();

  const [whiteColor, setWhiteColor] = useState<string>("gray");
  const [blackColor, setBlackColor] = useState<string>("gray");

  useEffect(() => {
    if (gameState.isUserWhite) {
      setWhiteColor("blue");
    } else if (gameState.isUserBlack) {
      setBlackColor("blue");
    } else if (gameState.isOpponentWhite) {
      setWhiteColor("red");
    } else if (gameState.isOpponentBlack) {
      setBlackColor("red");
    }
  }, [gameState.whiteUid, gameState.blackUid]);

  function onSelectWhite(): void {
    if (
      gameState.isWatcher ||
      gameState.isOpponentWhite ||
      gameState.isUserWhite
    ) {
      return;
    }

    gameState.selectSide(Side.White, () => {
      toast("Failed to select white");
    });
  }

  function onSelectBlack(): void {
    if (
      gameState.isWatcher ||
      gameState.isOpponentBlack ||
      gameState.isUserBlack
    ) {
      return;
    }

    gameState.selectSide(Side.Black, () => {
      toast("Failed to select black");
    });
  }

  return (
    <div className="overflow-hidden rounded-lg bg-gray-200">
      <div className="px-4 py-5 sm:p-6">
        <span
          onClick={onSelectWhite}
          className={[
            `inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium relative z-10 bg-${whiteColor}-100 text-${whiteColor}-600`,
            !gameState.isWatcher && !gameState.isOpponentWhite
              ? "cursor-pointer"
              : "cursor-default",
          ].join(" ")}
        >
          <svg
            className="h-1.5 w-1.5 fill-gray-400"
            viewBox="0 0 6 6"
            aria-hidden="true"
          >
            <circle cx="3" cy="3" r="3" />
          </svg>
          Light
        </span>
        <span
          onClick={onSelectBlack}
          className={[
            `inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium bg-${blackColor}-100 text-${blackColor}-600`,
            !gameState.isWatcher && !gameState.isOpponentBlack
              ? "cursor-pointer"
              : "cursor-default",
          ].join(" ")}
        >
          <svg
            className="h-1.5 w-1.5 fill-gray-400"
            viewBox="0 0 6 6"
            aria-hidden="true"
          >
            <circle cx="3" cy="3" r="3" />
          </svg>
          Dark
        </span>
      </div>
    </div>
  );
}
