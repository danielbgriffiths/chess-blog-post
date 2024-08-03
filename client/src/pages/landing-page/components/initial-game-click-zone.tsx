import { PuzzlePieceIcon } from "@heroicons/react/24/outline";

export function InitialGameClickZone(props: { onClickCreateGame: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClickCreateGame}
      className="relative flex flex-col justify-center items-center w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <PuzzlePieceIcon width={40} height={40} className="text-slate-500" />
      <span className="mt-2 block text-sm font-semibold text-gray-900">
        Create the First Game
      </span>
    </button>
  );
}
