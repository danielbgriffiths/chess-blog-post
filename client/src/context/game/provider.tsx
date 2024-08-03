import { GameContext } from "./create-context.tsx";

export interface GameReturn {}

export function GameProvider({ children }) {
  return <GameContext.Provider value={{}}>{children}</GameContext.Provider>;
}
