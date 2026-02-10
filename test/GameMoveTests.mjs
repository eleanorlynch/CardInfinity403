import assert from "node:assert";
import * as GameMove from "../server/GameMove.js";

// const Mover = new GameMove();
GameMove.createGame(123, [], []);
assert.equals(GameMove.getGame, 123);
