import { createBrowserRouter } from "react-router-dom";

import { LandingPage } from "../pages/landing-page";
import { GameSpace } from "../pages/game-space";

export enum RouteName {
  Root = "/",
  GameSpace = "/game-space",
}

export const router = createBrowserRouter([
  {
    path: RouteName.Root,
    element: <LandingPage />,
  },
  {
    path: RouteName.GameSpace,
    element: <GameSpace />,
  },
]);
