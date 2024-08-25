import { createContext } from "react";

import { BoardReturn } from "./provider";

export const BoardContext = createContext<BoardReturn>({} as BoardReturn);
