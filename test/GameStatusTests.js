import assert from "node:assert";
import { GameStatus } from "../server/GameStatus.js";

describe("GameStatus", function () {
  describe("#getGameId()", function () {
    it("should return the correct gameid for a game", function () {
      const players = [1];
      const ruleset = [2];
      const game = new Status(123, ruleset, players);
      assert.equal(game.getGameId(), 123);
    });
  });
  describe("#getRuleset()", function () {
    it("should return the correct ruleset for a game", function () {
      const players = [1];
      const ruleset = [2];
      const game = new Status(123, ruleset, players);
      assert.equal(game.getRuleset(), ruleset);
    });
  });
  describe("#getPlayers()", function () {
    it("should return the correct players for a game", function () {
      const players = [1];
      const ruleset = [2];
      const game = new Status(123, ruleset, players);
      assert.equal(game.getPlayers(), players);
    });
  });
});
