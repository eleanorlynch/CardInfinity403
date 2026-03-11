const assert = require("node:assert");
const GameMoveModule = require("../phaser-multiplayer-template/packages/server/src/card-game/GameMove.ts");
const { GameMove } = GameMoveModule;
const PlayerModule = require("../phaser-multiplayer-template/packages/server/src/card-game/Player.ts");
const { Player } = PlayerModule;
const CardModule = require("../phaser-multiplayer-template/packages/server/src/card-game/Card.ts");
const { Card } = CardModule;

describe ("GameMove", function () {

  describe ("#createGame()", function () {

    it ("should return the correct game when told to create one based on certain properties", async function () {
      const players = [new Player(0, []), new Player(1, [])];
      const Move = new GameMove();
      const game = await Move.createGame(123, players);

      assert.deepStrictEqual(game.getGameId(), 123);
      
      assert.deepStrictEqual(game.getPlayers(), players);
    });
  });

  describe ("#getGame()", function () {

    it ("should return the correct game when given its gameid", async function () {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = await Move.createGame(123, players);

      assert.strictEqual(Move.getGame(123), game);
    });
  });

  describe ("#handleDrawCard()", function() {

    it ("should allow the user to draw a card when they have not yet reached the draw limit", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = await Move.createGame(123, players);

      if (players[0] !== undefined && players[0].getHand() !== undefined) {
        const startLen = players[0].getHand().length;

        Move.handleDrawCard(123, 0);

        assert.strictEqual(players[0].getHand().length, startLen + 1);
      }
    });

    it ("shouldn't allow the user to draw a card when they have reached the draw limit", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = await Move.createGame(123, players);

      game.drawCard(0);
      game.drawCard(0);
      game.drawCard(0);

      if (players[0] !== undefined && players[0].getHand() !== undefined) {
        assert.deepStrictEqual(Move.handleDrawCard(123, 0), {message: 'User cannot draw any more cards this turn',
          success: false});
      }
    });

    it ("shouldn't allow the user to draw a card when they have reached the hand size limit", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = await Move.createGame(123, players);

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

    it ("should return an error when it is not the player's turn", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      await Move.createGame(123, players);

      assert.deepStrictEqual(Move.handleDrawCard(123, 1), { success: false, message: "Not your turn" });
    });

    it ("should return an error when the game does not exist", function() {
      const Move = new GameMove();

      assert.deepStrictEqual(Move.handleDrawCard(999, 0), { success: false, message: "Game not found" });
    });
  });

  describe ("#handleDiscardCard()", function() {

    it ("should allow the user to discard a card when they have not yet reached the discard limit", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = await Move.createGame(123, players);

      if (players !== undefined && players[0] !== undefined) {
        const hand = players[0].getHand();

        if (hand !== undefined && hand[0] !== undefined) {
          const cardToDiscard = hand[0];

          Move.handleDiscardCard(123, 0, cardToDiscard.getId());

          assert.strictEqual(players[0].getHand().length, 4);
          assert.strictEqual(players[0].getHand().includes(cardToDiscard), false);
        }
      }
    });

    it ("shouldn't allow the user to discard a card when they have reached the discard limit", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = await Move.createGame(123, players);

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

    it ("shouldn't allow the user to discard a card when they haven't yet drawn to start their turn", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = await Move.createGame(123, players);

      game.discardRules.whenToDiscard = "afterDraw";

      if (players !== undefined && players[0] !== undefined) {
        const hand = players[0].getHand();

        if (hand !== undefined && hand[0] !== undefined) {
          const cardToDiscard = hand[0];

          assert.deepStrictEqual(Move.handleDiscardCard(123, 0, cardToDiscard.getId()), { message: 'User must draw at least 1 card(s) before discarding a card',
            success: false });
        }
      }
    });

    it ("shouldn't allow the user to discard a card when it is not their turn", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = await Move.createGame(123, players);

      if (players[1] !== undefined) {
        const hand = players[1].getHand();

        if (hand !== undefined && hand[0] !== undefined) {
          assert.deepStrictEqual(Move.handleDiscardCard(123, 1, hand[0].getId()), { success: false, message: "Not your turn" });
        }
      }
    });

    it ("should return an error when the game does not exist", function() {
      const Move = new GameMove();

      assert.deepStrictEqual(Move.handleDiscardCard(999, 0, "fake-id"), { success: false, message: "Game not found" });
    });
  });

  describe ("#handlePlayCard()", function() {

    it ("should allow the user to play a card when they have not yet reached the play limit", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = await Move.createGame(123, players);

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

    it ("should allow the user to play a card when they have not yet reached the play limit and the card matches the suit of the top discard", async function() {
      const Move = new GameMove();
      const players = [new Player(0, [new Card("clubs", 2)]), new Player(1, [])];
      const game = await Move.createGame(123, players);

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
    });

    it ("shouldn't allow the user to play a card when it is not their turn", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = await Move.createGame(123, players);

      if (players[1] !== undefined) {
        const hand = players[1].getHand();

        if (hand !== undefined && hand[0] !== undefined) {
          assert.deepStrictEqual(Move.handlePlayCard(123, 1, hand[0].getId()), { success: false, message: "Not your turn" });
        }
      }
    });

    it ("shouldn't allow the user to play a card when they have reached the play limit", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = await Move.createGame(123, players);

      game.setPlayerHand([new Card("clubs", 2), new Card("hearts", 3), new Card("spades", 4), new Card("diamonds", 5)], 0);

      const hand = players[0].getHand();
      if (hand !== undefined) {
        Move.handlePlayCard(123, 0, hand[0].getId());
        Move.handlePlayCard(123, 0, hand[0].getId());
        Move.handlePlayCard(123, 0, hand[0].getId());

        assert.deepStrictEqual(Move.handlePlayCard(123, 0, hand[0].getId()), { success: false, message: "User cannot play any more cards this turn" });
      }
    });

    it ("should return an error when the game does not exist", function() {
      const Move = new GameMove();

      assert.deepStrictEqual(Move.handlePlayCard(999, 0, "fake-id"), { success: false, message: "Game not found" });
    });
  });

  describe ("#handleEndTurn()", function() {

    it ("should end the turn when the player has met the minimum play, draw, and discard requirements", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      await Move.createGame(123, players);

      if (players[0] !== undefined && players[0].getHand().length > 0) {
        Move.handleDrawCard(123, 0);
        Move.handlePlayCard(123, 0, players[0].getHand()[0].getId());
        Move.handleDiscardCard(123, 0, players[0].getHand()[0].getId());

        assert.deepStrictEqual(Move.handleEndTurn(123, 0), { success: true, message: "Turn ended" });
      }
    });

    it ("shouldn't end the turn when the player hasn't played the minimum required cards", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      await Move.createGame(123, players);

      if (players[0] !== undefined && players[0].getHand().length > 0) {
        Move.handleDrawCard(123, 0);
        Move.handleDiscardCard(123, 0, players[0].getHand()[0].getId());

        assert.deepStrictEqual(Move.handleEndTurn(123, 0), { success: false, message: "User must play at least 1 card(s) before ending their turn" });
      }
    });

    it ("shouldn't end the turn when the player hasn't drawn the minimum required cards", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      await Move.createGame(123, players);

      if (players[0] !== undefined && players[0].getHand().length > 0) {
        Move.handlePlayCard(123, 0, players[0].getHand()[0].getId());
        Move.handleDiscardCard(123, 0, players[0].getHand()[0].getId());

        assert.deepStrictEqual(Move.handleEndTurn(123, 0), { success: false, message: "User must draw at least 1 card(s) before ending their turn" });
      }
    });

    it ("shouldn't end the turn when the player hasn't discarded the minimum required cards", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      await Move.createGame(123, players);

      if (players[0] !== undefined && players[0].getHand().length > 0) {
        Move.handleDrawCard(123, 0);
        Move.handlePlayCard(123, 0, players[0].getHand()[0].getId());

        assert.deepStrictEqual(Move.handleEndTurn(123, 0), { success: false, message: "User must discard at least 1 card(s) before ending their turn" });
      }
    });

    it ("should return an error when the game does not exist", function() {
      const Move = new GameMove();

      assert.deepStrictEqual(Move.handleEndTurn(999, 0), { success: false, message: "Game not found" });
    });
  });

  describe ("#getGameState()", function() {

    it ("should return a success response with the correct game state for the current player", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      await Move.createGame(123, players);

      const result = Move.getGameState(123, 0);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.gameState.gameId, 123);
      assert.strictEqual(result.gameState.isMyTurn, true);
    });

    it ("should indicate it is not the player's turn when it is not", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      await Move.createGame(123, players);

      const result = Move.getGameState(123, 1);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.gameState.isMyTurn, false);
    });

    it ("should return an error when the game does not exist", function() {
      const Move = new GameMove();

      assert.deepStrictEqual(Move.getGameState(999, 0), { success: false, message: "Game not found" });
    });
  });

  describe ("#endGame()", function() {

    it ("should successfully end an existing game and remove it from active games", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      await Move.createGame(123, players);

      assert.deepStrictEqual(Move.endGame(123), { success: true, message: "Game ended" });
      assert.strictEqual(Move.getGame(123), undefined);
    });

    it ("should return a failure when trying to end a game that does not exist", function() {
      const Move = new GameMove();

      assert.deepStrictEqual(Move.endGame(999), { success: false, message: "Game not found" });
    });
  });

  describe ("#setGame()", function() {

    it ("should allow a game to be stored under a new ID and retrieved", async function() {
      const Move = new GameMove();
      const players = [new Player(0, []), new Player(1, [])];
      const game = await Move.createGame(123, players);

      const Move2 = new GameMove();
      Move2.setGame(456, game);

      assert.strictEqual(Move2.getGame(456), game);
    });
  });
});
