import { Board } from "./board";

export function ChessGame(props: { onLeaveGame: () => void }) {
  return (
    <div className="flex flex-wrap justify-start items-start h-[100vh]">
      <div className="flex flex-col justify-start items-start w-1/3 h-full p-4 bg-gray-50 border-r-gray-100 border-r-2">
        <div className="flex flex-col justify-center items-center w-full">
          <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:px-6"></div>
            <div className="px-4 py-5 sm:p-6"></div>
          </div>
          <button onClick={props.onLeaveGame}>Leave Game</button>
        </div>
      </div>
      <div className="flex justify-center items-center w-2/3 h-full p-8">
        <Board />
      </div>
    </div>
  );
}
