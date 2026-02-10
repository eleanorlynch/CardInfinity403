import assert from "node:assert";
import { GameMove } from "../server/GameMove.js";
import { GameStatus } from "../server/GameStatus.js";

const Status = new GameStatus(123, [], []);
const Move = new GameMove();
Move.createGame(123, [], []);
assert.strictEqual(Move.getGame, 123);
