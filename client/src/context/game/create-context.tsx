import { createContext } from "react";

import { GameReturn } from "./provider";

export const GameContext = createContext<GameReturn>({} as GameReturn);
