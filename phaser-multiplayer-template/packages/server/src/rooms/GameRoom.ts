import { Client, Room } from "colyseus";
import { GameMove } from "../card-game/GameMove";
import { Player } from "../card-game/Player";
import { loadDefaultRuleset } from "../card-game/loadRuleset";
import * as rulesetDb from "../rulesetDb";
import * as sessionDb from "../sessionDb";
import { GameStatus } from "../card-game/GameStatus";
import { GameWinner } from "../card-game/GameWinner";
import { isDatabaseConfigured } from "../db";

export class GameRoom extends Room {
  private gameMove = new GameMove();
  private gameId = 1;

  /** Host user id (for saving/restoring session). Set from room options. */
  private hostUserId: string | null = null;
  /** Session number for this room (for lookup in current_session). Set from room options. */
  private sessionNumber: number | null = null;
  /** Saved ruleset id to load from DB when creating a new game. Set from room options. */
  private rulesetId: number | null = null;

  // sessionId -> seat (0,1,...,n)
  private seatBySessionId = new Map<string, number>();

  async onCreate(options: any) {
    console.log("Room created:", this.roomId);
    this.hostUserId = options?.userId ?? null;
    this.sessionNumber = options?.sessionNumber ?? null;
    this.rulesetId = typeof options?.rulesetId === "number" ? options.rulesetId : null;

    let ruleset;
    if (this.rulesetId != null) {
      const row = await rulesetDb.getRulesetById(this.rulesetId);
      ruleset = row ? row.data : loadDefaultRuleset();
    } else {
      ruleset = loadDefaultRuleset();
    }
    this.maxClients = ruleset.maxPlayers;

    // message-based only for now (no schema sync yet)
    this.onMessage("DRAW", (client) => this.handleDraw(client));
    this.onMessage("PLAY_CARD", (client, msg: { cardId: string }) =>
      this.handlePlayCard(client, msg.cardId)
    );
    this.onMessage("END_TURN", (client) => this.handleEndTurn(client));
    this.onMessage("CHECK_WINNER", (client) => this.handleCheckWinner(client));
    this.onMessage("REQUEST_STATE", (client) => this.sendPrivateState(client));
  }

  async onJoin(client: Client) {
    console.log("Client:", client.sessionId, "joined room:", this.roomId);

    const seat = this.assignSeat(client.sessionId);

    // Create or restore game when first player joins
    if (!this.gameMove.getGame(this.gameId)) {
      const players = [new Player(0, [])];
      // Try restore from current_session if we have host + session_number and DB is configured
      if (
        isDatabaseConfigured() &&
        this.hostUserId != null &&
        this.sessionNumber != null
      ) {
        const saved = await sessionDb.getSession(
          this.hostUserId,
          this.sessionNumber
        );
        if (saved?.game_state) {
          const restored = GameStatus.fromSnapshot(saved.game_state);
          this.gameMove.setGame(this.gameId, restored);
        }
      }
      if (!this.gameMove.getGame(this.gameId)) {
        await this.gameMove.createGame(
          this.gameId,
          players,
          this.rulesetId ?? undefined,
          this.hostUserId
        );
      }
    }

    const game = this.gameMove.getGame(this.gameId);
    if (game) {
      // Ensure the Player object exists for this seat.
      while (game.players.length <= seat) {
        game.players.push(new Player(game.players.length, []));
      }

      // Deal initial hand to late-joining player using the ruleset's starting hand size
      const p = game.players[seat];
      if (p && (p.getHand()?.length ?? 0) === 0) {
        const hand = p.getHand() ?? [];

        for (let i = 0; i < game.handRules.startingHandSize; i++) {
          const card = game.deck.pop();
          if (card) hand.push(card);
        }
        p.setHand(hand);
      }
    }

    // Send updated private state to everyone so player 1 updates when player 2 joins
    this.broadcastPrivateStates();
  }

  onLeave(client: Client) {
    console.log("Client:", client.sessionId, "left room:", this.roomId);
    // Persist game state so the group can continue later
    const game = this.gameMove.getGame(this.gameId);
    if (
      game &&
      !game.gameOver &&
      isDatabaseConfigured() &&
      this.hostUserId != null &&
      this.sessionNumber != null
    ) {
      sessionDb
        .saveSession(this.hostUserId, this.sessionNumber, game.toSnapshot())
        .then(() => console.log("Session saved for", this.hostUserId, this.sessionNumber))
        .catch((err) => console.error("Failed to save session:", err));
    }
  }

  private assignSeat(sessionId: string): number {
    const existing = this.seatBySessionId.get(sessionId);
    if (existing !== undefined) return existing;

    const seat = this.seatBySessionId.size;
    this.seatBySessionId.set(sessionId, seat);
    return seat;
  }

  private handleDraw(client: Client) {
    const seat = this.seatBySessionId.get(client.sessionId);
    if (seat === undefined) return;

    const result = this.gameMove.handleDrawCard(this.gameId, seat);
    if (!result.success) {
      client.send("ERROR", { message: result.message });
      return;
    }

    this.broadcastPrivateStates();
  }

  private handlePlayCard(client: Client, cardId: string) {
    const seat = this.seatBySessionId.get(client.sessionId);
    if (seat === undefined) return;

    const result = this.gameMove.handlePlayCard(this.gameId, seat, cardId);
    if (!result.success) {
      client.send("ERROR", { message: result.message });
      return;
    }

    this.broadcastPrivateStates();
  }

  private handleEndTurn(client: Client) {
    const seat = this.seatBySessionId.get(client.sessionId);
    if (seat === undefined) return;

    const game = this.gameMove.getGame(this.gameId);
    if (!game) return;

    if (game.getCurrentTurn() !== seat) {
      client.send("ERROR", { message: "Not your turn" });
      return;
    }

    game.nextTurn();
    this.broadcastPrivateStates();
  }

  private handleCheckWinner(client: Client) {
    const seat = this.seatBySessionId.get(client.sessionId);
    if (seat === undefined) return;

    const game = this.gameMove.getGame(this.gameId);
    if (!game) return;

    const winnerInfo = new GameWinner().checkWinner(game);
    if (winnerInfo != null) {
      this.broadcast("GAME_OVER", winnerInfo);
    }

    this.broadcastPrivateStates();
  }

  private sendPrivateState(client: Client) {
    const seat = this.seatBySessionId.get(client.sessionId);
    if (seat === undefined) return;

    const stateResult = this.gameMove.getGameState(this.gameId, seat);
    if (!stateResult.success) return;

    client.send("PRIVATE_STATE", stateResult.gameState);
  }

  private broadcastPrivateStates() {
    for (const c of this.clients) {
      this.sendPrivateState(c);
    }
  }
}
