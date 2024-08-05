import { handlers } from "./handlers";
import { CompositionsReturn } from "../types";

const composeMiddleware = (...middlewares) => {
  return (...args) => {
    const run = (index) => {
      if (index < middlewares.length) {
        middlewares[index](...args, () => run(index + 1));
      }
    };

    run(0);
  };
};

export function compositions(...state): CompositionsReturn {
  const {
    connection,
    joinGameToWatch,
    joinGameToPlay,
    createGame,
    leaveGame,
    disconnect,
  } = handlers(...state);

  return {
    connection: composeMiddleware(connection),
    joinGameToWatch: composeMiddleware(joinGameToWatch),
    joinGameToPlay: composeMiddleware(joinGameToPlay),
    createGame: composeMiddleware(createGame),
    leaveGame: composeMiddleware(leaveGame),
    disconnect: composeMiddleware(disconnect),
  };
}
