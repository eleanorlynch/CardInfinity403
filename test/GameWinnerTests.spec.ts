import assert from "node:assert";
import { GameStatus } from "../phaser-multiplayer-template/packages/server/src/card-game/GameStatus.ts";
import { GameWinner } from "../phaser-multiplayer-template/packages/server/src/card-game/GameWinner.ts";
import { Card } from "../phaser-multiplayer-template/packages/server/src/card-game/Card.ts";

describe("GameWinner", function () {
    describe("#checkMostSuit()", function () {
        it("should return the player with the most cards of one suit if there is no tie", function() {
            const players = [1, 2];
            const ruleset = ["1"];
            const game = new GameStatus(1, ruleset, players);
            game.setPlayerHand([new Card("diamonds", 2), new Card("hearts", 2), new Card("diamonds", 2), new Card("hearts", 2), new Card("hearts", 2)], 0);
            game.setPlayerHand([new Card("diamonds", 2), new Card("spades", 2), new Card("diamonds", 2), new Card("hearts", 2), new Card("hearts", 2)], 1);
            game.setRound(3);
            const winner = new GameWinner;
            assert.strictEqual(winner.checkMostSuit(game), {boolean: false, number: 0});
        });
        it("should return the players with the msot card of one suit if there is a tie", function() {
            const players = [1, 2];
            const ruleset = ["1"];
            const game = new GameStatus(1, ruleset, players);
            game.setPlayerHand([new Card("diamonds", 2), new Card("hearts", 2), new Card("diamonds", 2), new Card("hearts", 2), new Card("hearts", 2)], 0);
            game.setPlayerHand([new Card("diamonds", 2), new Card("spades", 2), new Card("diamonds", 2), new Card("hearts", 2), new Card("hearts", 2)], 1);
            game.setRound(3);
            const winner = new GameWinner;
            const winnersList: number[] = [0, 1];
            assert.equal(winner.checkMostSuit(game), {boolean: true, winnersList});
        });
    });
});