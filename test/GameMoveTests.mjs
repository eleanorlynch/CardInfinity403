import assert from "node:assert";
import { GameMove } from "../server/GameMove.js";
import { GameStatus } from "../server/GameStatus.js";

describe("GameMove", function () {
  describe("#createGame()", function () {
    it("should return the correct game when told to create one based on certain properties", function () {
      const Move = new GameMove();
      const game = new GameStatus(123, [], []);
      assert.strictEqual(Move.createGame(123, [], []), game);
    });
  });
  describe("#getGame()", function () {
    it("should return the correct game when given its gameid", function () {
      //const Status = new GameStatus(123, [], []);
      const Move = new GameMove();
      const game2 = Move.createGame(123, [], []);
      assert.strictEqual(Move.getGame(123), game2);
    });
  });
});
