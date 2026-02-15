import assert from "node:assert";
import { GameStatus } from "../phaser-multiplayer-template/packages/server/src/card-game/GameStatus.ts";

describe("GameStatus", function () {
  describe("#getGameId()", function () {
    it("should return the correct gameid for a game", function () {
      const players = [1];
      const ruleset = [2];
      const game = new GameStatus(123, ruleset, players);
      assert.strictEqual(game.getGameId(), 123);
    });
  });
  describe("#getRuleset()", function () {
    it("should return the correct ruleset for a game", function () {
      const players = [1];
      const ruleset = [2];
      const game = new GameStatus(123, ruleset, players);
      assert.strictEqual(game.getRuleset(), ruleset);
    });
  });
  describe("#getPlayers()", function () {
    it("should return the correct players for a game", function () {
      const players = [1];
      const ruleset = [2];
      const game = new GameStatus(123, ruleset, players);
      assert.strictEqual(game.getPlayers(), players);
    });
  });
});
