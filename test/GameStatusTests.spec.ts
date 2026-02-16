import assert from "node:assert";
import { GameStatus } from "../phaser-multiplayer-template/packages/server/src/card-game/GameStatus.ts";
import { Player } from "../phaser-multiplayer-template/packages/server/src/card-game/Player.ts";
import { Card } from "../phaser-multiplayer-template/packages/server/src/card-game/Card.ts";

describe("GameStatus", function () {
  describe("#getGameId()", function () {
    it("should return the correct gameid for a game", function () {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      assert.strictEqual(game.getGameId(), 123);
    });
  });
  describe("#getRuleset()", function () {
    it("should return the correct ruleset for a game", function () {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      assert.strictEqual(game.getRuleset(), ruleset);
    });
  });
  describe("#getPlayers()", function () {
    it("should return the correct players for a game", function () {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      assert.strictEqual(game.getPlayers(), players);
    });
  });
  describe("#nextTurn()", function() {
    it("should update the current turn to the next player", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.nextTurn();
      assert.strictEqual(game.getCurrentTurn(), 1);
    });
    it("should leave gameOver at false if there is no winner at the end of a turn", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.nextTurn();
      assert.strictEqual(game.gameOver, false);
    });
    it("should set gameOver to true if there is a winner at the end of a turn and set tied to true is there is a tie", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.setRound(3);
      game.nextTurn();
      assert.strictEqual(game.gameOver, true);
      assert.strictEqual(game.tied, true);
    });
    it("should set gameOver to true if there is a winner at the end of a turn and leave tied at false if there is no tie", function() {
      const players = [new Player(0, [new Card("diamonds", 2), new Card("hearts", 2), new Card("diamonds", 2), new Card("hearts", 2), new Card("hearts", 2)]), 
                      new Player(1, [new Card("diamonds", 2), new Card("diamonds", 2), new Card("spades", 2), new Card("hearts", 2), new Card("hearts", 2)])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.setRound(3);
      game.nextTurn();
      assert.strictEqual(game.gameOver, true);
      assert.strictEqual(game.tied, false);
    });
  });
  describe("#getDrawsThisTurn()", function () {
    it("should return the number of draws that have been made this turn", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      game.shuffleDeck();
      game.drawCard(0);
      assert.strictEqual(game.getDrawsThisTurn(), 1);
    });
  });
  describe("#getPlaysThisTurn()", function () {
    it("should return the number of plays that have been made this turn", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      game.shuffleDeck();
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
  // Add test once rule selection is implemented, currently impossible to test this in the beta release
 /* describe("#getDiscardsThisTurn()", function () {
    it("should return the number of discards that have been made this turn", function() {
      const players = [new Player(0, []), new Player(1, [])]; 
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      game.shuffleDeck();
      game.drawCard(0);
      if (players[0] !== undefined) {
        const hand = players[0].getHand();
        if (hand !== undefined && hand.length > 0 && hand[0] !== undefined) {
          const cardId = hand[0].getId();
          game.discardCard(0, cardId);
          assert.strictEqual(game.getDiscardsThisTurn(), 1);
        }
      }
    });
  }); */
  describe("#createDeck()", function() {
    it("should create a deck of the correct size based on the ruleset", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      assert.strictEqual(game.getDeckCount(), 52);
    });
  });
  describe("#shuffleDeck()", function() {
    it("should shuffle the deck so that the order of the cards is different", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      const unshuffledDeck = [...game.deck];
      game.shuffleDeck();
      assert.notDeepStrictEqual(game.deck, unshuffledDeck);
    });
  });
  describe("#dealCards()", function() {
    it("should deal the correct number of cards to each player based on the ruleset", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      game.shuffleDeck();
      game.dealCards();
      if (players[0] !== undefined && players[0].getHand() !== undefined) {
        assert.strictEqual(players[0].getHand().length, 3);
      }
      if (players[1] !== undefined && players[1].getHand() !== undefined) {
        assert.strictEqual(players[1].getHand().length, 3);
      }
    });
  });
  describe("#drawCard()", function() {
    it("should allow a player to draw a card and add it to their hand", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      game.shuffleDeck();
      game.drawCard(0);
      if (players[0] !== undefined && players[0].getHand() !== undefined) {
        assert.strictEqual(players[0].getHand().length, 1);
      }
    });
  });
  describe("#playCard()", function() {
    it("should allow a player to play a card from their hand and add it to the discard pile", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      game.shuffleDeck();
      game.drawCard(0);
      if (players[0] !== undefined && players[0].getHand() !== undefined) {
        const hand = players[0].getHand();
        if (hand.length > 0 && hand[0] !== undefined) {
          const cardId = hand[0].getId();
          game.playCard(0, cardId);
          assert.strictEqual(game.discardPile.length, 1);
        }
      }
    });
    it("shouldn't allow a player to play a card that is not in their hand", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      game.shuffleDeck();
      const fakeCardId = "fake_card_id";
      game.playCard(0, fakeCardId);
      assert.strictEqual(game.discardPile.length, 0);
    });
  });
  describe("#discardCard()", function() {
    it("should allow a player to discard a card from their hand and add it to the discard pile on their turn," 
      + " and end the turn if the rules dictate it", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      game.shuffleDeck();
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
    it("shouldn't allow a player to discard a card that is not in their hand", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      game.shuffleDeck();
      game.drawCard(0);
      const fakeCardId = "fake_card_id";
      game.discardCard(0, fakeCardId);
      assert.strictEqual(game.discardPile.length, 0);
    });
     it("shouldn't allow a player to discard a card when it is not their turn", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      game.shuffleDeck();
      game.dealCards();
      game.drawCard(1);
      if (players[1] !== undefined && players[1].getHand() !== undefined) {
        const hand = players[1].getHand();
        if (hand.length > 0 && hand[0] !== undefined) {
          const cardId = hand[0].getId();
          assert.deepStrictEqual(game.discardCard(1, cardId), { success: false, message: "Not your turn" });
        }
      }
    });
    // add test for not allowing discard after game over once custom rules are implemented to allow that
  });
  describe("#getTopDiscard()", function() {
    it("should return the top card of the discard pile", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      game.shuffleDeck();
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
  });
  describe("#getDeckCount()", function() {
    it("should return the number of cards left in the deck", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      game.createDeck();
      game.shuffleDeck();
      assert.strictEqual(game.getDeckCount(), 52);
    });
  });
  describe("#getCurrentTurn()", function() {
    it("should return the player id of the current turn", function() {
      const players = [new Player(0, []), new Player(1, [])];
      const ruleset = ["2"];
      const game = new GameStatus(123, ruleset, players);
      assert.strictEqual(game.getCurrentTurn(), 0);
    });
  });
  describe("#setRound()", function() {
    it("should update the round number and reset draws, plays, and discards this turn to 0", function() {
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
  describe("#setPlayerHand()", function() {
    it("should set the player's hand to the given hand", function() {
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
});
