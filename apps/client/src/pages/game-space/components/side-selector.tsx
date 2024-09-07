import { memo, useMemo } from "react";
import { toast } from "react-toastify";
import { Side } from "@chess-blog-post/common";

import { useGameState } from "../../../hooks/use-game-state";

const SideSelectorButton = memo(function Component({
  isEnabled,
  isUserSelected,
  isOpponentSelected,
  onClick,
  label,
}: {
  isEnabled: boolean;
  isUserSelected: boolean;
  isOpponentSelected: boolean;
  onClick: () => void;
  label: string;
}) {
  const colorClass = useMemo(() => {
    if (!isEnabled) return `bg-gray-100`;
    if (isUserSelected) return "bg-blue-100";
    if (isOpponentSelected) return "bg-red-100";
    return "bg-gray-100";
  }, [isUserSelected, isOpponentSelected, isEnabled]);

  return (
    <span
      onClick={onClick}
      className={[
        `inline-flex items-center gap-x-1.5 rounded-full px-3 mx-2 py-2 text-sm font-medium`,
        isEnabled && !isUserSelected ? "cursor-pointer" : "cursor-default",
        colorClass,
      ].join(" ")}
    >
      <svg className="h-1.5 w-1.5" viewBox="0 0 6 6" aria-hidden="true">
        <circle cx="3" cy="3" r="3" />
      </svg>
      {label}
    </span>
  );
});

export const SideSelector = memo(function Component() {
  const gameState = useGameState();

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
    <div className="overflow-hidden rounded-lg shadow-xl bg-gray-200 relative z-10 py-4">
      <div className="px-4 pb-4">
        <SideSelectorButton
          isEnabled={!gameState.isWatcher && !gameState.isOpponentWhite}
          isUserSelected={gameState.isUserWhite}
          isOpponentSelected={gameState.isOpponentWhite}
          label="White"
          onClick={onSelectWhite}
        />
        <SideSelectorButton
          isEnabled={!gameState.isWatcher && !gameState.isOpponentBlack}
          isUserSelected={gameState.isUserBlack}
          isOpponentSelected={gameState.isOpponentBlack}
          label="Black"
          onClick={onSelectBlack}
        />
      </div>
      {(!gameState.whiteUid || !gameState.blackUid) && (
        <div className="px-4">
          <p className="text-sm">Waiting for other player ...</p>
        </div>
      )}
    </div>
  );
});
