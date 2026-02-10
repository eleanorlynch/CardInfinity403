import assert from "node:assert";
import { GameMove } from "../server/GameMove.js";
//import { GameStatus } from "../server/GameStatus.js";

const Mover = new GameMove();
Mover.createGame(123, [], []);
assert.equals(Mover.getGame, 123);
