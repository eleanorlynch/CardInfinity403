import assert from "node:assert";
import { GameMove } from "../server/GameMove.js";
import { GameStatus } from "../server/GameStatus.js";

describe("GameMove", function () {
  describe('#getGameId()", function () {
    it("should return the correct gameid for a game", function () {
      const players = [1];
      const ruleset = [2];
      game4 = Move.createGame(123, players, ruleset);
      assert.equal(game4.getGameId(), 123);
    });
  });
  describe("#createGame()", function () {
    it("should return the correct game when told to create one based on certain properties", function () {
      const Move = new GameMove();
      const game = new GameStatus(123, ruleset, players);
      const game2 = Move.createGame(123, ruleset, players);
      assert.equal(game2.getGameId(), game.getGameId());
      assert.equal(game2.getRuleset(), 3);
      assert.equal(game2.getPlayers(), game.getPlayers());
    });
  });
  describe("#getGame()", function () {
    it("should return the correct game when given its gameid", function () {
      //const Status = new GameStatus(123, [], []);
      const Move = new GameMove();
      const game3 = Move.createGame(123, [], []);
      assert.strictEqual(Move.getGame(123), game3);
    });
  });
});
