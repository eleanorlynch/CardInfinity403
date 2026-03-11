const assert = require("node:assert");
const GameStatusModule = require("../phaser-multiplayer-template/packages/server/src/card-game/GameStatus.ts");
const { GameStatus } = GameStatusModule;
const GameWinnerModule = require("../phaser-multiplayer-template/packages/server/src/card-game/GameWinner.ts");
const { GameWinner } = GameWinnerModule;
const PlayerModule = require("../phaser-multiplayer-template/packages/server/src/card-game/Player.ts");
const { Player } = PlayerModule;
const CardModule = require("../phaser-multiplayer-template/packages/server/src/card-game/Card.ts");
const { Card } = CardModule;

function makeGame(players: any) {
  return new GameStatus(1, ["test"], players);
}

describe ("GameWinner", function () {

    describe ("#checkMostOfOneSuit()", function () {

        it ("should return the player with the most cards of one suit if there is no tie", function() {
            const players = [new Player(0, [new Card("diamonds", 2), new Card("hearts", 2), new Card("diamonds", 2), new Card("hearts", 2), new Card("hearts", 2)]), 
                new Player(1, [new Card("diamonds", 2), new Card("spades", 2), new Card("diamonds", 2), new Card("hearts", 2), new Card("hearts", 2)])];
            const ruleset = ["1"];
            const game = new GameStatus(1, ruleset, players);
            const winner = new GameWinner;

            game.setRound(3);

            assert.deepStrictEqual(winner.checkMostOfOneSuit(game), {tie: false, winner: 0});
        });

        it ("should return the players with the most card of one suit if there is a tie", function() {
            const players = [new Player(0, [new Card("diamonds", 2), new Card("hearts", 2), new Card("diamonds", 2), new Card("hearts", 2), new Card("hearts", 2)]), 
                new Player(1, [new Card("diamonds", 2), new Card("diamonds", 2), new Card("hearts", 2), new Card("hearts", 2), new Card("hearts", 2)])];
            const ruleset = ["1"];
            const game = new GameStatus(1, ruleset, players);
            const winner = new GameWinner;
            const winnersList: number[] = [0, 1];

            assert.deepStrictEqual(winner.checkMostOfOneSuit(game), {tie: true, winners: winnersList});
        });

        it ("should return that all players are tied if all players have no cards left", function() {
            const players = [new Player(0, []), 
                new Player(1, [])];
            const ruleset = ["1"];
            const game = new GameStatus(1, ruleset, players);
            const winner = new GameWinner;
            const winnersList: number[] = [0, 1];

            assert.deepStrictEqual(winner.checkMostOfOneSuit(game), {tie: true, winners: winnersList, message: "All players have no cards left!"});
        });
    });

    describe ("#checkWinner()", function() {

        it ("should return null when not enough rounds have passed", function() {
            const players = [new Player(0, [new Card("hearts", 2)]), new Player(1, [new Card("spades", 3)])];
            const game = makeGame(players);
            const winner = new GameWinner();

            assert.strictEqual(winner.checkWinner(game), null);
        });

        it ("should route to checkFirstToHandSize when chosen and max rounds not reached", function() {
            const players = [new Player(0, []), new Player(1, [new Card("hearts", 2)])];
            const game = makeGame(players);

            game.winConditions.firstToHandSize.chosen = true;
            game.winConditions.firstToHandSize.handSizeTarget = 0;
            game.minNumRounds = 0;

            const winner = new GameWinner();
            const result = winner.checkWinner(game);

            assert.strictEqual(result.winner, 0);
            assert.strictEqual(result.winCondition, 'hand_size');
        });

        it ("should route to checkLeastCardsInHand when chosen and max rounds reached", function() {
            const players = [new Player(0, [new Card("hearts", 1)]), new Player(1, [new Card("hearts", 2), new Card("clubs", 3)])];
            const game = makeGame(players);

            game.winConditions.leastCardsInHand.chosen = true;
            game.minNumRounds = 0;
            game.maxNumRounds = 0;
            game.setRound(0);

            const winner = new GameWinner();
            const result = winner.checkWinner(game);

            assert.strictEqual(result.winner, 0);
            assert.strictEqual(result.winCondition, 'least_cards_in_hand');
        });
    });

  describe ("#checkFirstToScore()", function() {

    it ("should return the first player whose hand rank sum meets or exceeds the score target", function() {
      const players = [new Player(0, [new Card("hearts", 8), new Card("clubs", 5)]),
                       new Player(1, [new Card("diamonds", 2)])];
      const game = makeGame(players);

      game.winConditions.firstToScore.scoreTarget = 10;

      const winner = new GameWinner();

      assert.deepStrictEqual(winner.checkFirstToScore(game), {
        winner: 0,
        winCondition: 'score',
        message: 'Player has reached 10 points!'
      });
    });

    it ("should return null when no player has reached the score target", function() {
      const players = [new Player(0, [new Card("hearts", 3)]), new Player(1, [new Card("clubs", 2)])];
      const game = makeGame(players);
      game.winConditions.firstToScore.scoreTarget = 100;
      const winner = new GameWinner();

      assert.strictEqual(winner.checkFirstToScore(game), null);
    });
  });

  describe ("#checkFirstToHandSize()", function() {

    it ("should return the player whose hand size equals the target", function() {
      const players = [new Player(0, [new Card("hearts", 2), new Card("clubs", 3)]),
                       new Player(1, [])];
      const game = makeGame(players);
      game.winConditions.firstToHandSize.handSizeTarget = 0;
      const winner = new GameWinner();

      assert.deepStrictEqual(winner.checkFirstToHandSize(game), {
        winner: 1,
        winCondition: 'hand_size',
        message: 'Player has reached 0 cards!'
      });
    });

    it ("should return null when no player has reached the hand size target", function() {
      const players = [new Player(0, [new Card("hearts", 2)]), new Player(1, [new Card("clubs", 3)])];
      const game = makeGame(players);
      game.winConditions.firstToHandSize.handSizeTarget = 0;
      const winner = new GameWinner();

      assert.strictEqual(winner.checkFirstToHandSize(game), null);
    });
  });

  describe ("#checkLastToHaveCardsInHand()", function() {

    it ("should return the player who is last to still hold cards", function() {
      const players = [new Player(0, []), new Player(1, [new Card("hearts", 4)]), new Player(2, [])];
      const game = makeGame(players);
      const winner = new GameWinner();

      assert.deepStrictEqual(winner.checkLastToHaveCardsInHand(game), {
        winner: 1,
        winCondition: 'last_to_have_cards_in_hand',
        message: 'Player is the last to have cards in hand!'
      });
    });

    it ("should return null when more than one player still has cards", function() {
      const players = [new Player(0, [new Card("hearts", 2)]), new Player(1, [new Card("clubs", 3)])];
      const game = makeGame(players);
      const winner = new GameWinner();

      assert.strictEqual(winner.checkLastToHaveCardsInHand(game), null);
    });

    it ("should return null when all players have cards", function() {
      const players = [new Player(0, [new Card("hearts", 2)]), new Player(1, [new Card("clubs", 3)])];
      const game = makeGame(players);
      const winner = new GameWinner();

      assert.strictEqual(winner.checkLastToHaveCardsInHand(game), null);
    });
  });

  describe ("#checkCollectsSetOfCards()", function() {

    it ("should return the player who holds the required set of cards", function() {
      const players = [new Player(0, [new Card("hearts", 2), new Card("clubs", 5)]),
                       new Player(1, [new Card("diamonds", 3)])];
      const game = makeGame(players);
      game.winConditions.collectsSetOfCards.set = [{ rank: 2, suit: "hearts" }, { rank: 5, suit: "clubs" }];
      const winner = new GameWinner();

      assert.deepStrictEqual(winner.checkCollectsSetOfCards(game), {
        winner: 0,
        winCondition: 'collects_set_of_cards',
        message: 'Player has collected the set of cards!'
      });
    });

    it ("should return null when no player holds the complete required set", function() {
      const players = [new Player(0, [new Card("hearts", 9)]), new Player(1, [new Card("clubs", 7)])];
      const game = makeGame(players);
      game.winConditions.collectsSetOfCards.set = [{ rank: 2, suit: "hearts" }, { rank: 5, suit: "clubs" }];
      const winner = new GameWinner();

      assert.strictEqual(winner.checkCollectsSetOfCards(game), null);
    });
  });

  describe ("#checkLeastCardsInHand()", function() {

    it ("should return the player with the fewest cards when there is no tie", function() {
      const players = [new Player(0, [new Card("hearts", 2)]),
                       new Player(1, [new Card("clubs", 3), new Card("spades", 4)])];
      const game = makeGame(players);
      const winner = new GameWinner();

      const result = winner.checkLeastCardsInHand(game);

      assert.strictEqual(result.winner, 0);
      assert.strictEqual(result.winCondition, 'least_cards_in_hand');
    });

    it ("should return a tie when multiple players share the fewest cards", function() {
      const players = [new Player(0, [new Card("hearts", 2)]), new Player(1, [new Card("clubs", 3)])];
      const game = makeGame(players);
      const winner = new GameWinner();

      const result = winner.checkLeastCardsInHand(game);

      assert.strictEqual(result.tie, true);
      assert.deepStrictEqual(result.winners, [0, 1]);
    });
  });

  describe ("#checkMostCardsInHand()", function() {

    it ("should return the player with the most cards when there is no tie", function() {
      const players = [new Player(0, [new Card("hearts", 2), new Card("clubs", 3), new Card("spades", 4)]),
                       new Player(1, [new Card("diamonds", 5)])];
      const game = makeGame(players);
      const winner = new GameWinner();

      const result = winner.checkMostCardsInHand(game);

      assert.strictEqual(result.winner, 0);
      assert.strictEqual(result.winCondition, 'most_cards_in_hand');
    });

    it ("should return a tie when multiple players share the most cards", function() {
      const players = [new Player(0, [new Card("hearts", 2)]), new Player(1, [new Card("clubs", 3)])];
      const game = makeGame(players);
      const winner = new GameWinner();

      const result = winner.checkMostCardsInHand(game);

      assert.strictEqual(result.tie, true);
      assert.deepStrictEqual(result.winners, [0, 1]);
    });
  });

  describe ("#checkMostOfOneSuit()", function() {

    it ("should return the player with the most cards of a single suit when there is no tie", function() {
      const players = [new Player(0, [new Card("hearts", 2), new Card("hearts", 3), new Card("clubs", 4)]),
                       new Player(1, [new Card("hearts", 5), new Card("spades", 6)])];
      const game = makeGame(players);
      game.winConditions.mostOfOneSuit.suit = "any";
      const winner = new GameWinner();

      const result = winner.checkMostOfOneSuit(game);

      assert.strictEqual(result.tie, false);
      assert.strictEqual(result.winner, 0);
    });

    it ("should return a tie when players share the most cards of any single suit", function() {
      const players = [new Player(0, [new Card("hearts", 2), new Card("hearts", 3)]),
                       new Player(1, [new Card("diamonds", 4), new Card("diamonds", 5)])];
      const game = makeGame(players);
      game.winConditions.mostOfOneSuit.suit = "any";
      const winner = new GameWinner();

      const result = winner.checkMostOfOneSuit(game);

      assert.strictEqual(result.tie, true);
    });

    it ("should return all players tied when all hands are empty", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const game = makeGame(players);
      game.winConditions.mostOfOneSuit.suit = "any";
      const winner = new GameWinner();

      const result = winner.checkMostOfOneSuit(game);

      assert.strictEqual(result.tie, true);
      assert.strictEqual(result.message, "All players have no cards left!");
    });
  });

  describe ("#checkMostOfOneRank()", function() {

    it ("should return the player with the most cards of a specific rank when there is no tie", function() {
      const players = [new Player(0, [new Card("hearts", 2), new Card("clubs", 2), new Card("spades", 2)]),
                       new Player(1, [new Card("diamonds", 2)])];
      const game = makeGame(players);
      game.winConditions.mostOfOneRank.rank = 2;
      const winner = new GameWinner();

      const result = winner.checkMostOfOneRank(game);

      assert.strictEqual(result.tie, false);
      assert.strictEqual(result.winner, 0);
    });

    it ("should return a tie when players share the most cards of a specific rank", function() {
      const players = [new Player(0, [new Card("hearts", 2)]), new Player(1, [new Card("clubs", 2)])];
      const game = makeGame(players);
      game.winConditions.mostOfOneRank.rank = 2;
      const winner = new GameWinner();

      const result = winner.checkMostOfOneRank(game);

      assert.strictEqual(result.tie, true);
    });
  });

  describe ("#checkMostOfOneColor()", function() {

    it ("should return the player with the most red cards when color is red", function() {
      const players = [new Player(0, [new Card("hearts", 2), new Card("diamonds", 3), new Card("hearts", 4)]),
                       new Player(1, [new Card("spades", 5), new Card("hearts", 6)])];
      const game = makeGame(players);
      game.winConditions.mostOfOneColor.color = "red";
      const winner = new GameWinner();

      const result = winner.checkMostOfOneColor(game);

      assert.strictEqual(result.tie, false);
      assert.strictEqual(result.winner, 0);
    });

    it ("should return a tie when players share the most cards of the given color", function() {
      const players = [new Player(0, [new Card("hearts", 2)]), new Player(1, [new Card("diamonds", 3)])];
      const game = makeGame(players);
      game.winConditions.mostOfOneColor.color = "red";
      const winner = new GameWinner();

      const result = winner.checkMostOfOneColor(game);

      assert.strictEqual(result.tie, true);
    });

    it ("should return all players tied when all hands are empty", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const game = makeGame(players);
      game.winConditions.mostOfOneColor.color = "red";
      const winner = new GameWinner();

      const result = winner.checkMostOfOneColor(game);

      assert.strictEqual(result.tie, true);
      assert.strictEqual(result.message, "All players have no cards left!");
    });
  });
});