const loadDefaultRulesetModule = require("../phaser-multiplayer-template/packages/server/dist/card-game/loadRuleset");
const { loadDefaultRuleset } = loadDefaultRulesetModule;
const assert = require("node:assert");
const GameStatusModule = require("../phaser-multiplayer-template/packages/client/src/utils/server/GameStatus.ts");
const { GameStatus } = GameStatusModule;
const PlayerModule = require("../phaser-multiplayer-template/packages/client/src/utils/server/Player.ts");
const { Player } = PlayerModule;
const CardModule = require("../phaser-multiplayer-template/packages/client/src/utils/server/Card.ts");
const { Card } = CardModule;
const ServerGameStatusModule = require("../phaser-multiplayer-template/packages/server/src/card-game/GameStatus.ts");
const { GameStatus: ServerGameStatus } = ServerGameStatusModule;
const ServerPlayerModule = require("../phaser-multiplayer-template/packages/server/src/card-game/Player.ts");
const { Player: ServerPlayer } = ServerPlayerModule;
const ServerCardModule = require("../phaser-multiplayer-template/packages/server/src/card-game/Card.ts");
const { Card: ServerCard } = ServerCardModule;

describe ("GameStatus", function () {

  describe ("#getGameId()", function () {

    it ("should return the correct gameid for a game", function () {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);

      assert.strictEqual(game.getGameId(), 123);
    });
  });

  describe ("#getRuleset()", function () {

    it ("should return the correct ruleset for a game", function () {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);

      assert.strictEqual(game.getRuleset(), ruleset);
    });
  });

  describe ("#getPlayers()", function () {

    it ("should return the correct players for a game", function () {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);

      assert.strictEqual(game.getPlayers(), players);
    });
  });

  describe ("#nextTurn()", function() {

    it ("should advance the current turn to the next player", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const game = new GameStatus(1, ["2"], players);

      game.nextTurn();

      assert.strictEqual(game.getCurrentTurn(), 1);
    });

    it ("should increment totalRounds when the turn wraps back to player 0", function() {
      const players = [new Player(0, [new Card("hearts", 1)]), new Player(1, [new Card("hearts", 1)])];
      const game = new GameStatus(1, ["2"], players);

      game.nextTurn();
      game.nextTurn();

      assert.strictEqual(game.totalRounds, 1);
      assert.strictEqual(game.getCurrentTurn(), 0);
    });

    it ("should set gameOver to true when a winner is found at the end of a turn", function() {
      const players = [new ServerPlayer(0, []), new ServerPlayer(1, [new ServerCard("hearts", 1)])];
      const game = new ServerGameStatus(1, ["2"], players);

      game.winConditions.firstToHandSize.chosen = true;
      game.winConditions.firstToHandSize.handSizeTarget = 0;
      game.minNumRounds = 0;

      game.nextTurn();

      assert.strictEqual(game.gameOver, true);
    });

    it ("should keep the same player's turn when extraTurn is set", function() {
      const players = [new ServerPlayer(0, []), new ServerPlayer(1, [])];
      const game = new ServerGameStatus(1, ["2"], players);

      game.extraTurn = true;
      game.nextTurn();

      assert.strictEqual(game.getCurrentTurn(), 0);
      assert.strictEqual(game.extraTurn, false);
    });

    it ("should skip the next player when skipNextPlayer is set (3-player game)", function() {
      const players = [new ServerPlayer(0, []), new ServerPlayer(1, []), new ServerPlayer(2, [])];
      const game = new ServerGameStatus(1, ["2"], players);

      game.skipNextPlayer = true;
      game.nextTurn();

      assert.strictEqual(game.getCurrentTurn(), 2);
      assert.strictEqual(game.skipNextPlayer, false);
    });

    it ("should go backwards when reverseTurnOrder is set", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const game = new GameStatus(1, ["2"], players);

      game.reverseTurnOrder = true;
      game.nextTurn();

      assert.strictEqual(game.getCurrentTurn(), 1);
    });

    it ("should reset drawsThisTurn, playsThisTurn, and discardsThisTurn to 0", function() {
      const ruleset = loadDefaultRuleset();
      const players = [new Player(0, []), new Player(1, [])];
      const game = new GameStatus(1, ruleset, players);

      game.createDeck();
      game.shuffleDeck();
      game.drawCard(0);

      assert.strictEqual(game.getDrawsThisTurn(), 1);

      game.nextTurn();

      assert.strictEqual(game.getDrawsThisTurn(), 0);
      assert.strictEqual(game.getPlaysThisTurn(), 0);
      assert.strictEqual(game.getDiscardsThisTurn(), 0);
    });
  });

  describe ("#getDrawsThisTurn()", function () {

    it ("should return the number of draws that have been made this turn", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);

      game.createDeck();
      game.shuffleDeck();
      game.drawCard(0);

      assert.strictEqual(game.getDrawsThisTurn(), 1);
    });
  });

  describe ("#getPlaysThisTurn()", function () {

    it ("should return the number of plays that have been made this turn", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);

      game.drawCard(0);

      if (players[0] !== undefined) {
        const hand = players[0].getHand();

        if (hand !== undefined && hand.length > 0 && hand[0] !== undefined) {
          const cardId = hand[0].getId();

          game.playCard(0, cardId);

          assert.strictEqual(game.getPlaysThisTurn(), 1);
        }
      }
    }); 
  });

  describe ("#createDeck()", function() {

    it ("should create a deck of the correct size based on the ruleset", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      assert.strictEqual(game.getDeckCount(), 52);
    });
  });

  describe ("#shuffleDeck()", function() {

    it ("should shuffle the deck so that the order of the cards is different", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);

      game.createDeck();

      const unshuffledDeck = [...game.deck];

      game.shuffleDeck();

      assert.notDeepStrictEqual(game.deck, unshuffledDeck);
    });
  });

  describe ("#dealCards()", function() {

    it ("should deal the correct number of cards per player based on the ruleset startingHandSize", function() {
      const ruleset = loadDefaultRuleset();
      const players = [new ServerPlayer(0, []), new ServerPlayer(1, [])];
      const game = new ServerGameStatus(1, ruleset, players);

      game.createDeck();
      game.shuffleDeck();
      game.dealCards();

      if (players[0] !== undefined) {
        assert.strictEqual(players[0].getHand().length, ruleset.handRules.startingHandSize);
      }
      if (players[1] !== undefined) {
        assert.strictEqual(players[1].getHand().length, ruleset.handRules.startingHandSize);
      }
    });

    it ("should place one card on the discard pile after dealing", function() {
      const ruleset = loadDefaultRuleset();
      const players = [new ServerPlayer(0, []), new ServerPlayer(1, [])];
      const game = new ServerGameStatus(1, ruleset, players);

      game.createDeck();
      game.shuffleDeck();
      game.dealCards();

      assert.strictEqual(game.discardPile.length, 1);
    });
  });

  describe ("#drawCard()", function() {

    it ("should allow a player to draw a card and add it to their hand", function() {
      const ruleset = loadDefaultRuleset();
      const players = [new Player(0, []), new Player(1, [])];
      const game = new GameStatus(1, ruleset, players);

      game.createDeck();
      game.shuffleDeck();

      if (players[0] !== undefined) {
        game.drawCard(0);
        assert.strictEqual(players[0].getHand().length, 1);
      }
    });

    it ("should return failure if the game is already over", function() {
      const ruleset = loadDefaultRuleset();
      const players = [new Player(0, []), new Player(1, [])];
      const game = new GameStatus(1, ruleset, players);

      game.createDeck();
      game.shuffleDeck();
      game.gameOver = true;

      assert.deepStrictEqual(game.drawCard(0), { success: false, message: "Game is over" });
    });

    it ("should return failure if it isn't the player's turn", function() {
      const ruleset = loadDefaultRuleset();
      const players = [new Player(0, []), new Player(1, [])];
      const game = new GameStatus(1, ruleset, players);

      game.createDeck();
      game.shuffleDeck();

      const result = game.drawCard(1);

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.message, "Not your turn");
    });
  });

  describe ("#playCard()", function() {

    it ("should allow a player to play a card from their hand onto the discard pile", function() {
      const ruleset = loadDefaultRuleset();
      const players = [new Player(0, []), new Player(1, [])];
      const game = new GameStatus(1, ruleset, players);

      game.createDeck();
      game.shuffleDeck();
      game.drawCard(0);

      if (players[0] !== undefined) {
        const hand = players[0].getHand();

        if (hand.length > 0 && hand[0] !== undefined) {
          const cardId = hand[0].getId();
          game.playCard(0, cardId);

          assert.strictEqual(game.discardPile.length, 1);
        }
      }
    });

    it ("shouldn't allow a player to play a card when it is not their turn", function() {
      const ruleset = loadDefaultRuleset();
      const players = [new Player(0, [new Card("hearts", 2)]), new Player(1, [new Card("diamonds", 3)])];
      const game = new GameStatus(1, ruleset, players);

      if (players[1] !== undefined) {
        const hand = players[1].getHand();
        if (hand[0] !== undefined) {
          assert.deepStrictEqual(game.playCard(1, hand[0].getId()), { success: false, message: "Not your turn" });
        }
      }
    });

    it ("shouldn't allow a player to play a card that is not in their hand", function() {
      const ruleset = loadDefaultRuleset();
      const players = [new Player(0, []), new Player(1, [])];
      const game = new GameStatus(1, ruleset, players);

      assert.deepStrictEqual(game.playCard(0, "fake_card_id"), { success: false, message: "Card not in your hand" });
    });
  });

  describe ("#discardCard()", function() {

    it ("should allow a player to discard a card from their hand and add it to the discard pile on their turn", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);

      game.drawCard(0);

      if (players[0] !== undefined && players[0].getHand() !== undefined) {
        const hand = players[0].getHand();

        if (hand.length > 0 && hand[0] !== undefined) {
          const cardId = hand[0].getId();

          game.discardCard(0, cardId);

          assert.strictEqual(game.discardPile.length, 1);
          assert.strictEqual(game.getCurrentTurn(), 1);
        }
      }
    });

    it ("shouldn't allow a player to discard a card that is not in their hand", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      const fakeCardId = "fake_card_id";

      game.drawCard(0);
      game.discardCard(0, fakeCardId);

      assert.strictEqual(game.discardPile.length, 0);
    });

    it("shouldn't allow a player to discard a card when it is not their turn", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);

      if (players[1] !== undefined && players[1].getHand() !== undefined) {
        const hand = players[1].getHand();

        if (hand.length > 0 && hand[0] !== undefined) {
          const cardId = hand[0].getId();

          assert.deepStrictEqual(game.discardCard(1, cardId), { success: false, message: "Not your turn" });
        }
      }
    });
  });

  describe ("#getTopDiscard()", function() {

    it ("should return the top card of the discard pile", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);

      game.drawCard(0);

      if (players[0] !== undefined && players[0].getHand() !== undefined) {
        const hand = players[0].getHand();

        if (hand.length > 0 && hand[0] !== undefined) {
          const cardId = hand[0].getId();

          game.playCard(0, cardId);

          const topDiscard = game.getTopDiscard();

          if (topDiscard !== null && topDiscard !== undefined) {
            assert.strictEqual(topDiscard.getId(), cardId);
          }
        }
      }
    });

    it ("should return null when the discard pile is empty", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const game = new GameStatus(1, ["2"], players);

      assert.strictEqual(game.getTopDiscard(), null);
    });
  });

  describe ("#getDeckCount()", function() {

    it ("should return the number of cards left in the deck", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);

      game.createDeck();
      game.shuffleDeck();

      assert.strictEqual(game.getDeckCount(), 52);
    });
  });

  describe ("#getCurrentTurn()", function() {

    it ("should return the player id of the current turn", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);

      assert.strictEqual(game.getCurrentTurn(), 0);
    });
  });

  describe ("#setRound()", function() {

    it ("should update the round number and reset draws, plays, and discards this turn to 0", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);

      game.setRound(1);

      assert.strictEqual(game.totalRounds, 1);
      assert.strictEqual(game.getDrawsThisTurn(), 0);
      assert.strictEqual(game.getPlaysThisTurn(), 0);
      assert.strictEqual(game.getDiscardsThisTurn(), 0);
    });
  });

  describe ("#setPlayerHand()", function() {

    it ("should set the player's hand to the given hand", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      const newHand = [new Card("diamonds", 2), new Card("hearts", 2)];

      game.setPlayerHand(newHand, 0);

      if (players[0] !== undefined) {
        assert.strictEqual(players[0].getHand(), newHand);
      }
    });
  });

  describe ("#setDiscardPile()", function() {

    it ("should replace the discard pile with the given cards", function() {
      const players = [new ServerPlayer(0, []), new ServerPlayer(1, [])];
      const game = new ServerGameStatus(1, ["2"], players);
      const pile = [new ServerCard("hearts", 3)];

      game.setDiscardPile(pile);

      assert.strictEqual(game.discardPile, pile);
    });
  });

  describe ("#getGameState()", function() {

    it ("should return the correct gameId and indicate it is the current player's turn", function() {
      const players = [new Player(0, [new Card("hearts", 2)]), new Player(1, [])];
      const game = new GameStatus(42, ["2"], players);

      const state = game.getGameState(0);

      assert.strictEqual(state.gameId, 42);
      assert.strictEqual(state.isMyTurn, true);
      assert.strictEqual(state.currentTurn, 0);
    });

    it ("should indicate it is not the player's turn when it is not", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const game = new GameStatus(1, ["2"], players);

      const state = game.getGameState(1);

      assert.strictEqual(state.isMyTurn, false);
    });

    it ("should return hand counts for all players and only show myHand for the requesting player", function() {
      const players = [new Player(0, [new Card("hearts", 2), new Card("clubs", 5)]), new Player(1, [new Card("spades", 7)])];
      const game = new GameStatus(1, ["2"], players);

      const state = game.getGameState(0);

      assert.strictEqual(state.myHand.length, 2);
      assert.strictEqual(state.players[0].handCount, 2);
      assert.strictEqual(state.players[1].handCount, 1);
    });
  });

  describe ("#toSnapshot() and #fromSnapshot()", function() {

    it ("should serialize and reconstruct a game with the same key state", function() {
      const ruleset = loadDefaultRuleset();
      const players = [new ServerPlayer(0, []), new ServerPlayer(1, [])];
      const game = new ServerGameStatus(99, ruleset, players);

      game.createDeck();
      game.shuffleDeck();
      game.dealCards();

      const snapshot = game.toSnapshot();
      const restored = ServerGameStatus.fromSnapshot(snapshot);

      assert.strictEqual(restored.getGameId(), game.getGameId());
      assert.strictEqual(restored.getCurrentTurn(), game.getCurrentTurn());
      assert.strictEqual(restored.getDeckCount(), game.getDeckCount());
      assert.strictEqual(restored.gameOver, game.gameOver);
      assert.strictEqual(
        restored.getPlayers()[0].getHand().length,
        game.getPlayers()[0].getHand().length
      );
    });
  });
});