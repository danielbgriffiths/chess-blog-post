import { createBrowserRouter } from "react-router-dom";

import { Index } from "../pages/landing-page";
import { Index } from "../pages/game-space";

export enum RouteName {
  Root = "/",
  GameSpace = "/game-space",
}

export const router = createBrowserRouter([
  {
    path: RouteName.Root,
    element: <Index />,
  },
  {
    path: RouteName.GameSpace,
    element: <Index />,
  },
]);
