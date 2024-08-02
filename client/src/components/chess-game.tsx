export function ChessGame() {
  return (
    <div className="flex flex-wrap justify-start items-start h-[100vh]">
      <div className="flex flex-col justify-start items-start w-1/3 h-full p-4 bg-gray-50 border-r-gray-100 border-r-2">
        <div className="flex flex-col justify-center items-center w-full">
          <Heading />
          <Settings />
          <Monitor />
          <History />
        </div>
      </div>
      <div className="flex justify-center items-center w-2/3 h-full p-8">
        <Board />
      </div>
    </div>
  );
}
