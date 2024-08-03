import { useContext } from "react";

import { GameReturn } from "./provider";
import { GameContext } from "./create-context";

export function useGame(): GameReturn {
  return useContext(GameContext);
}
