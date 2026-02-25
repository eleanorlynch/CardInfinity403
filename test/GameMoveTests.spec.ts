const assert = require("node:assert");
const GameMoveModule = require("../phaser-multiplayer-template/packages/server/src/card-game/GameMove.ts");
const { GameMove } = GameMoveModule;
const GameStatusModule = require("../phaser-multiplayer-template/packages/server/src/card-game/GameStatus.ts");
const { GameStatus } = GameStatusModule;
const PlayerModule = require("../phaser-multiplayer-template/packages/server/src/card-game/Player.ts");
const { Player } = PlayerModule;
const CardModule = require("../phaser-multiplayer-template/packages/server/src/card-game/Card.ts");
const { Card } = CardModule;

describe("GameMove", function () {
  describe("#createGame()", function () {
    it("should return the correct game when told to create one based on certain properties", function () {
      const players = [new Player(0, []), new Player(1, [])];
      //const ruleset = ["2"];
      const Move = new GameMove();
      //const game = new GameStatus(123, ruleset, players);
      const game2 = Move.createGame(123, players);
      //assert.deepStrictEqual(game2.getGameId(), game.getGameId());
      //assert.deepStrictEqual(game2.getRuleset(), game.getRuleset());
      //assert.deepStrictEqual(game2.getPlayers(), game.getPlayers());
      assert.deepStrictEqual(game2.getGameId(), 123);
      // add tests for correct ruleset
      assert.deepStrictEqual(game2.getPlayers(), players);
    });
  });
  describe("#getGame()", function () {
    it("should return the correct game when given its gameid", function () {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = Move.createGame(123, players);
      assert.strictEqual(Move.getGame(123), game);
    });
  });
  describe("#handleDrawCard()", function() {
    it("should allow the user to draw a card when they have not yet reached the draw limit", function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = Move.createGame(123, players);
      if (players[0] !== undefined && players[0].getHand() !== undefined) {
        const startLen = players[0].getHand().length;
        Move.handleDrawCard(123, 0);
        assert.strictEqual(players[0].getHand().length, startLen + 1);
      }
    });
    it("shouldn't allow the user to draw a card when they have reached the draw limit", function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = Move.createGame(123, players);
      game.drawCard(0);
      game.drawCard(0);
      game.drawCard(0);
      if (players[0] !== undefined && players[0].getHand() !== undefined) {
        assert.deepStrictEqual(Move.handleDrawCard(123, 0), {message: 'User cannot draw any more cards this turn', 
          success: false});
      }
    });
    it("shouldn't allow the user to draw a card when they have reached the hand size limit", function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = Move.createGame(123, players);
      Move.handleDrawCard(123, 0);
      Move.handleDrawCard(123, 0);
      Move.handleDrawCard(123, 0);
      game.setRound(1);
      Move.handleDrawCard(123, 0);
      Move.handleDrawCard(123, 0);
      if (players[0] !== undefined && players[0].getHand() !== undefined) {
        assert.deepStrictEqual(Move.handleDrawCard(123, 0), { message: 'User cannot draw more cards, hand size limit reached', 
          success: false });
      }
    }); 
  });
  describe("#handleDiscardCard()", function() {
    it("should allow the user to discard a card when they have not yet reached the discard limit", function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = Move.createGame(123, players);
      if (players !== undefined && players[0] !== undefined) {
        const hand = players[0].getHand();
        if (hand !== undefined && hand[0] !== undefined) {
          //Move.handleDrawCard(123, 0);
          const cardToDiscard = hand[0];
          Move.handleDiscardCard(123, 0, cardToDiscard.getId());
          assert.strictEqual(players[0].getHand().length, 4);
          assert.strictEqual(players[0].getHand().includes(cardToDiscard), false);
        }
      }
    }); 
    it("shouldn't allow the user to discard a card when they have reached the discard limit", function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = Move.createGame(123, players);
      if (players !== undefined && players[0] !== undefined) {
        const hand = players[0].getHand();
        if (hand !== undefined && hand[0] !== undefined) {
          const cardToDiscard = hand[0];
          Move.handleDiscardCard(123, 0, cardToDiscard.getId());
          const cardToDiscard2 = hand[0];
          Move.handleDiscardCard(123, 0, cardToDiscard2.getId());
          const cardToDiscard3 = hand[0];
          Move.handleDiscardCard(123, 0, cardToDiscard3.getId());
          const cardToDiscard4 = hand[0];
          assert.deepStrictEqual(Move.handleDiscardCard(123, 0, cardToDiscard4.getId()), { message: 'User cannot discard more than 3 card(s) this turn', 
            success: false });
        }
      }
    }); 
    // Cannot be tested in the current implementation
   /* it("shouldn't allow the user to discard a card when they haven't yet drawn to start their turn", function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = Move.createGame(123, players);
      if (players !== undefined && players[0] !== undefined) {
        const hand = players[0].getHand();
        if (hand !== undefined && hand[0] !== undefined) {
          const cardToDiscard = hand[0];
          assert.deepStrictEqual(Move.handleDiscardCard(123, 0, cardToDiscard.getId()), { message: 'User has not yet drawn a card this turn', 
            success: false });
        }
      }
    }); */
  });
  describe("#handlePlayCard()", function() {
    it("should allow the user to play a card when they have not yet reached the play limit", function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = Move.createGame(123, players);
      game.setPlayerHand([new Card("clubs", 2)], 0);
      if (players !== undefined && players[0] !== undefined) {
        const hand = players[0].getHand();
        if (hand !== undefined && hand[0] !== undefined) {
          const cardToPlay = hand[0];
          assert.deepStrictEqual(Move.handlePlayCard(123, 0, cardToPlay.getId()), {success: true, message: "Card played successfully",
            playerHand: [], discardTop: cardToPlay, nextPlayer: 0 });
        }
      }
    });
   /* it("should allow the user to play a card when they have not yet reached the play limit, have not drawn a card this turn,"
      + " and the card matches the suit of the top discard", function() {
      const Move = new GameMove();
      const players = [new Player(0, [new Card("clubs", 2)]), new Player(1, [])];
      const game = Move.createGame(123, players);
      game.setDiscardPile([new Card("clubs", 3)]);
      game.setPlayerHand([new Card("clubs", 2)], 0);
      if (players !== undefined && players[0] !== undefined) {
        const hand = players[0].getHand();
        if (hand !== undefined && hand[0] !== undefined) {
          const cardToPlay = hand[0];
          assert.deepStrictEqual(Move.handlePlayCard(123, 0, cardToPlay.getId()), {success: true, message: "Card played successfully",
            playerHand: [], discardTop: cardToPlay, nextPlayer: 0 });
        }
      }
    }); */
  });
});