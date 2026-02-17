import { Client, Room } from "colyseus";
import { GameMove } from "../card-game/GameMove";
import { Player } from "../card-game/Player";

export class GameRoom extends Room {
  private gameMove = new GameMove();
  private gameId = 1;

  // sessionId -> seat (0,1,...,n)
  private seatBySessionId = new Map<string, number>();

  maxClients = 2; // just doing 2 players for now, will update later based on what we want

  onCreate(options: any) {
    console.log("Room created:", this.roomId);
    // message-based only for now (no schema sync yet)
    this.onMessage("DRAW", (client) => this.handleDraw(client));
    this.onMessage("PLAY_CARD", (client, msg: { cardId: string }) =>
      this.handlePlayCard(client, msg.cardId)
    );
    this.onMessage("END_TURN", (client) => this.handleEndTurn(client));
  }

  onJoin(client: Client) {
    console.log("Client:", client.sessionId, "joined room:", this.roomId);

    const seat = this.assignSeat(client.sessionId);

    // create game when first player joins
    if (!this.gameMove.getGame(this.gameId)) {
      const ruleset = ["2"];
      const players = [new Player(0, [])];
      this.gameMove.createGame(this.gameId, ruleset, players);
    }

    const game = this.gameMove.getGame(this.gameId);
    if (game) {
      // Ensure the Player object exists for this seat.
      while (game.players.length <= seat) {
        game.players.push(new Player(game.players.length, []));
      }
      
      // Deal initial hand to late-joining player (match GameStatus.dealCards() = 3)
      const p = game.players[seat];
      if (p && (p.getHand()?.length ?? 0) === 0) {
        const hand = p.getHand() ?? [];
        for (let i = 0; i < 3; i++) {
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