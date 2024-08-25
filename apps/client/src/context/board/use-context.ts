import { useContext } from "react";

import { BoardReturn } from "./provider";
import { BoardContext } from "./create-context";

export function useBoard(): BoardReturn {
  return useContext(BoardContext);
}
