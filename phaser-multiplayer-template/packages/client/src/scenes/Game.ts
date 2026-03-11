import { Scene } from "phaser";
import { Client as ColyseusClient, Room } from "colyseus.js"

interface Card {
  suit: string;
  rank: number | string;
  id: string;
  code?: string;
}

export class Game extends Scene {
  gameId: number = 1;
  playerId: number = 0;
  cardSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  discardPileSprite: Phaser.GameObjects.Container | null = null;
  deckSprite: Phaser.GameObjects.Container | null = null;
  statusText: Phaser.GameObjects.Text | null = null;
  drawButton: Phaser.GameObjects.Text | null = null;
  endTurnButton: Phaser.GameObjects.Text | null = null;
  // Colyseus multiplayer:
  private netClient?: ColyseusClient;
  private room?: Room;
  private netState: any = null;

  constructor() {
    super("Game");
  }

  async create() {
    const width = Number(this.game.config.width);
    const height = Number(this.game.config.height);

    // Forest Green background
    this.cameras.main.setBackgroundColor("#2C853B");

    // =========================
    // TABLE LAYOUT
    // =========================
    const tableGraphics = this.add.graphics();

    tableGraphics.lineStyle(2, 0xE9DFD9, 0.6);

    // Outer table
    tableGraphics.strokeRoundedRect(
      width * 0.15,
      height * 0.15,
      width * 0.7,
      height * 0.55,
      15
    );

    // Inner play area
    tableGraphics.strokeRoundedRect(
      width * 0.25,
      height * 0.25,
      width * 0.5,
      height * 0.35,
      15
    );

    // Bottom hand area
    tableGraphics.strokeRoundedRect(
      width * 0.15,
      height * 0.75,
      width * 0.7,
      height * 0.13,
      10
    );

    // =========================
    // BACK BUTTON (Top Left)
    // =========================
    const backButton = this.add
      .text(width * 0.05, height * 0.05, "← Back", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#E9DFD9",
        backgroundColor: "#101814",
        padding: { x: 12, y: 6 }
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true });

    backButton.on("pointerover", () => {
      backButton.setStyle({ backgroundColor: "#891900" });
    });

    backButton.on("pointerout", () => {
      backButton.setStyle({ backgroundColor: "#101814" });
    });

    backButton.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });

    // =========================
    // STATUS TEXT
    // =========================
    this.statusText = this.add
      .text(width * 0.5, height * 0.35, "Game Start！", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#E9DFD9",
        align: "center"
      })
      .setOrigin(0.5);

    // =========================
    // DRAW BUTTON
    // =========================
    this.drawButton = this.add
      .text(width * 0.5, height * 0.65, "Draw", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#101814",
        backgroundColor: "#EBC9B3",
        padding: { x: 20, y: 10 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.drawButton.on("pointerover", () => {
      if (this.drawButton && !this.isGameOver()) {
        this.drawButton.setStyle({ backgroundColor: "#D4B89A" });
      }
    });

    this.drawButton.on("pointerout", () => {
      if (this.drawButton) {
        this.drawButton.setStyle({ backgroundColor: "#EBC9B3" });
      }
    });

    this.drawButton.on("pointerdown", () => {
      if (!this.isGameOver()) {
        this.handleDrawCard();
      }
    });

    // =========================
    // END TURN BUTTON
    // =========================
    this.endTurnButton = this.add
      .text(width * 0.5, height * 0.72, "End Turn", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#101814",
        backgroundColor: "#EBC9B3",
        padding: { x: 20, y: 10 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.endTurnButton.on("pointerover", () => {
      if (this.endTurnButton && !this.isGameOver()) {
        this.endTurnButton.setStyle({ backgroundColor: "#D4B89A" });
      }
    });

    this.endTurnButton.on("pointerout", () => {
      if (this.endTurnButton) {
        this.endTurnButton.setStyle({ backgroundColor: "#EBC9B3" });
      }
    });

    this.endTurnButton.on("pointerdown", () => {
      if (!this.room) return;
      if (this.netState?.gameOver) return;
      this.room.send("END_TURN");
    });
    // After UI is ready, connect to the Colyseus room
    if (this.statusText) {
      this.statusText.setText("Connecting...");
    }
    await this.connectToRoom().catch((err) => {
      console.error(err);
      if (this.statusText) this.statusText.setText("Failed to connect");
    });
  }

  resetGameState() {
    const gameId = this.gameId;

    // Clean up existing sprites
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites.clear();
    
    if (this.discardPileSprite !== null) {
      this.discardPileSprite.destroy();
      this.discardPileSprite = null;
    }
    
    if (this.deckSprite !== null) {
      this.deckSprite.destroy();
      this.deckSprite = null;
    }

    // Reset text references (they will be recreated in create())
    this.statusText = null;
    this.drawButton = null;

    // Reset game move manager
    // TODO: Make sure this replacement works
    if (this.room === undefined) {
      console.warn("No room connection, cannot reset ");
      return;
    }

    if (this.netState?.gameOver === true) {
      return;
    }

    console.log("Sending END_GAME to server");
    this.room.send("END_GAME", { gameId });
  }

  updateDisplay() {
    const gameId = this.gameId;
    const playerId = this.playerId;

    var game = null;
    var stateResult: any = null;

    if (this.room === undefined) {
      console.warn("No room connection, cannot update");
      return;
    }

    if (this.netState?.gameOver === true) {
      return;
    }

    console.log("Sending GET_GAME to server");
    this.room.send("GET_GAME", { gameId });
    
    this.room.onMessage("GAME", (state) => {
      game = state;
    })

    // Get the actual game object for winner checking   
    if (game === null) {
      return;
    }

    // Get game state
   console.log("Sending GET_GAME_STATE to server");
   this.room.send("GET_GAME_STATE", { gameId, playerId });

   this.room.onMessage("GAME_STATE", (state) => {
    stateResult = state;
   })
    
   if (stateResult.success === false || (stateResult.gameState === undefined || stateResult.gameState === null)) {
      return;
   }

    const gameState = stateResult.gameState;
    const width = Number(this.game.config.width);
    const height = Number(this.game.config.height);

    console.log("Sending CHECK_WINNER to server");
    this.room.send("CHECK_WINNER");

    var winnerResult: any = null;
    this.room.onMessage("GAME_OVER", (winnerId) => {
      winnerResult = winnerId;
    })

    // Update status text
    if (this.statusText !== null) {
      if (winnerResult) {
        this.statusText.setText(`You win！${winnerResult.message}`);
      } else if (gameState.gameOver === true) {
        this.statusText.setText("Game Over！");
      } else {
        this.statusText.setText(`Hand: ${gameState.myHand.length} cards | Deck: ${gameState.deckCount} cards`);
      }
    }

    // Update draw button visibility
    if (this.drawButton !== null) {
      this.drawButton.setVisible(!gameState.gameOver);
    }

    // Clear existing card sprites
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites.clear();

    // Display player's hand at bottom
    this.displayHand(gameState.myHand, width * 0.5, height * 0.82);

    // Display discard pile in center
    if (gameState.discardTop !== null && gameState.discardTop !== undefined) {
      this.displayDiscardPile(gameState.discardTop, width * 0.5, height * 0.45);
    }

    // Display deck count
    this.displayDeckCount(gameState.deckCount, width * 0.3, height * 0.45);
  }

  displayHand(cards: Card[], centerX: number, y: number) {
    const spacing = 70;
    const startX = centerX - ((cards.length - 1) * spacing) / 2;

    cards.forEach((card, index) => {
      const x = startX + index * spacing;
      const cardSprite = this.createCardSprite(card, x, y, 0.7, true);
      this.cardSprites.set(`hand-${card.id}`, cardSprite);
    });
  }

  displayDiscardPile(card: Card, x: number, y: number) {
    if (this.discardPileSprite !== null) {
      this.discardPileSprite.destroy();
    }

    this.discardPileSprite = this.createCardSprite(card, x, y, 1, false);
  }

  displayDeckCount(count: number, x: number, y: number) {
    if (this.deckSprite !== null) {
      this.deckSprite.destroy();
    }

    const container = this.add.container(x, y);

    // Draw card back
    const cardBack = this.add.graphics();

    cardBack.fillStyle(0x1a4d8c);
    cardBack.fillRoundedRect(-30, -45, 60, 90, 5);
    cardBack.lineStyle(2, 0xffffff);
    cardBack.strokeRoundedRect(-30, -45, 60, 90, 5);
    container.add(cardBack);

    // Add count text
    const countText = this.add.text(0, 0, count.toString(), {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#E9DFD9",
      backgroundColor: "#000000",
      padding: { x: 5, y: 2 }
    }).setOrigin(0.5);

    container.add(countText);

    this.deckSprite = container;
  }

  createCardSprite(card: Card, x: number, y: number, scale: number, interactive: boolean): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Card background
    const cardBg = this.add.graphics();

    cardBg.fillStyle(0xffffff);
    cardBg.fillRoundedRect(-30, -45, 60, 90, 5);
    cardBg.lineStyle(2, 0x000000);
    cardBg.strokeRoundedRect(-30, -45, 60, 90, 5);
    container.add(cardBg);

    // Card suit color
    const suitColor = card.suit === "hearts" || card.suit === "diamonds" ? "#ff0000" : "#000000";

    const rankStr = typeof card.rank === "number" ? String(card.rank) : card.rank;
    const rankText = this.add.text(-20, -35, rankStr, {
      fontFamily: "Arial",
      fontSize: "20px",
      color: suitColor,
      fontStyle: "bold"
    });
    container.add(rankText);

    // Card suit symbol
    const suitSymbols: { [key: string]: string } = {
      hearts: "♥",
      diamonds: "♦",
      clubs: "♣",
      spades: "♠"
    };
    const suitText = this.add.text(15, -35, suitSymbols[card.suit] || "", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: suitColor,
      fontStyle: "bold"
    });

    container.add(suitText);

    // Large suit symbol in center
    const centerSuit = this.add.text(0, 5, suitSymbols[card.suit] || "", {
      fontFamily: "Arial",
      fontSize: "36px",
      color: suitColor
    }).setOrigin(0.5);

    container.add(centerSuit);

    container.setScale(scale);

    if (interactive && !this.isGameOver()) {
      container.setInteractive(new Phaser.Geom.Rectangle(-30, -45, 60, 90), Phaser.Geom.Rectangle.Contains);

      container.on("pointerover", () => {
        container.setY(y - 10);
        container.setScale(scale * 1.1);
      });

      container.on("pointerout", () => {
        container.setY(y);
        container.setScale(scale);
      });

      container.on("pointerdown", () => {
        this.handlePlayCard(card.id);
      });
    }

    return container;
  }

  isGameOver(): boolean {
    // !! ensures that if netState is undefined or null, then it returns false (essentially same as a Boolean cast)
    return !!this.netState?.gameOver;
  }

  // multiplayer handle draw using room
  handleDrawCard() {
    if (this.room === undefined) {
      console.warn("No room connection, cannot draw");
      return;
    }

    if (this.netState?.gameOver === true) {
      return;
    }

    console.log("Sending DRAW to server");
    this.room.send("DRAW");
  }

  handlePlayCard(cardId: string) {
    if (this.room === undefined) {
      console.warn("No room connection, cannot play card");
      return;
    }

    if (this.netState?.gameOver === true) {
      return;
    }

    console.log(`Sending PLAY_CARD with id ${cardId} to server`);
    this.room.send("PLAY_CARD", { cardId });

    if (this.isGameOver()) {
      this.room.send("WINNER_CHECK");
    }
  }

  private async connectToRoom() {
    const data = this.scene.settings.data as any;
    const isHost: boolean = data?.isHost ?? true;
    const roomId: string | undefined = data?.roomId;
    const rulesetId = this.registry.get("rulesetId") as number | undefined;

    const isLocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    const url = isLocalhost
      ? "ws://localhost:3001"
      : `wss://${location.host}/.proxy/api/colyseus`;

    this.netClient = new ColyseusClient(url);

    try {
      if (isHost) {
        this.room = await this.netClient.create("game", rulesetId != null ? { rulesetId } : {});
        // Display the room code so the host can share it
        const width = Number(this.game.config.width);
        const roomId = this.room.roomId;
        const roomCodeText = this.add.text(width * 0.5, Number(this.game.config.height) * 0.08, `Room Code: ${roomId}  ⧉`, {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#EBC9B3",
          backgroundColor: "#101814",
          padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        roomCodeText.on("pointerover", () => roomCodeText.setColor("#ffffff"));
        roomCodeText.on("pointerout", () => roomCodeText.setColor("#EBC9B3"));
        roomCodeText.on("pointerdown", () => {
          navigator.clipboard.writeText(roomId).then(() => {
            roomCodeText.setText(`Room Code: ${roomId}  ✓ Copied!`);
            this.time.delayedCall(2000, () => {
              roomCodeText.setText(`Room Code: ${roomId}  ⧉`);
            });
          }).catch(() => {
            roomCodeText.setText(`Room Code: ${roomId}  (copy failed)`);
            this.time.delayedCall(2000, () => {
              roomCodeText.setText(`Room Code: ${roomId}  ⧉`);
            });
          });
        });
      } else {
        if (!roomId) {
          if (this.statusText) this.statusText.setText("No room code provided.");
          return;
        }
        this.room = await this.netClient.joinById(roomId);
      }
    } catch (err: any) {
      if (this.statusText) {
        const msg = err?.message ?? "";
        if (msg.includes("not found") || err?.code === 4212) {
          this.statusText.setText("Room not found. Check the code.");
        } else if (msg.includes("full")) {
          this.statusText.setText("Room is full.");
        } else {
          this.statusText.setText("Failed to connect.");
        }
      }
      return;
    }

    this.room.onMessage("PRIVATE_STATE", (state) => {
      this.netState = state;
      this.updateDisplayFromNet();
    });

    this.room.onMessage("ERROR", (msg: any) => {
      if (this.statusText) this.statusText.setText(msg?.message ?? "Error");
    });

    if (this.statusText) this.statusText.setText("Connected...");
    this.room.send("REQUEST_STATE");
  }

  private updateDisplayFromNet() {
    if (this.netState === undefined || this.netState === null) {
      return;
    }

    const width = Number(this.game.config.width);
    const height = Number(this.game.config.height);

    // Clear existing card sprites
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites.clear();

    const myHand: Card[] = this.netState.myHand ?? [];
    const discardTop: Card | null = this.netState.discardTop ?? null;
    const deckCount: number = this.netState.deckCount ?? 0;
    const gameOver: boolean = this.netState.gameOver ?? false;

    if (this.statusText !== null) {
      if (gameOver) {
        this.statusText.setText("Game Over!");
      } else {
        const handCount = myHand.length;
        const deckStr = deckCount.toString();
        this.statusText.setText(
          this.netState.isMyTurn
            ? `Your turn | Hand: ${handCount} | Deck: ${deckStr}`
            : `Opponent turn | Hand: ${handCount} | Deck: ${deckStr}`
        );
      }
    }

    if (this.drawButton !== null) {
      this.drawButton.setVisible(!gameOver && !!this.netState?.isMyTurn);
    }

    if (this.endTurnButton !== null) {
      this.endTurnButton.setVisible(!gameOver && !!this.netState?.isMyTurn);
    }

    // Render from server state
    this.displayHand(myHand, width * 0.5, height * 0.82);

    if (discardTop !== null) {
      this.displayDiscardPile(discardTop, width * 0.5, height * 0.45);
    }

    this.displayDeckCount(deckCount, width * 0.3, height * 0.45);
  }
}