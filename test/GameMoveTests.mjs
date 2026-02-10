import assert from "node:assert";
import { GameMove } from "../server/GameMove.js";
import { GameStatus } from "../server/GameStatus.js";

describe("GameMove", function () {
  describe("#createGame()", function () {
    it("should return the correct game when told to create one based on certain properties", function () {
      const Move = new GameMove();
      const game = new GameStatus(gameId, ruleset, players);
      assert.strictEqual(Move.createGame(123, [], []));
    }
  }
  describe("#getGame()", function () {
    it("should return the correct game when given its gameid", function () {
      //const Status = new GameStatus(123, [], []);
      const Move = new GameMove();
      const game = new GameStatus(gameId, ruleset, players);
      const game = Move.createGame(123, [], []);
      assert.strictEqual(Move.getGame(123), game);
    });
  });
});
