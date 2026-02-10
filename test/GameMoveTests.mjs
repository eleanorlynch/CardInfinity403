import assert from "node:assert";
import * as GameMove from '../server/GameMove.js';

const Mover = new GameMove();
Mover.createGame(123, [], []);
assert.equals(Mover.getGame, 123);
