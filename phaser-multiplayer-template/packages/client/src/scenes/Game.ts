import { Scene } from "phaser";
import { GameMove } from "../utils/server/GameMove.js";
import { GameWinner } from "../utils/server/GameWinner.js";

interface Card {
  suit: string;
  rank: string;
  id: string;
  code: string;
}

export class Game extends Scene {
  gameMove: GameMove | null = null;
  gameId: string = "single-player-game";
  playerId: string = "player1";
  cardSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  discardPileSprite: Phaser.GameObjects.Container | null = null;
  deckSprite: Phaser.GameObjects.Container | null = null;
  statusText: Phaser.GameObjects.Text | null = null;
  drawButton: Phaser.GameObjects.Text | null = null;

  constructor() {
    super("Game");
  }

  create() {
    // Reset all game state when entering the scene
    this.resetGameState();

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

    // Initialize game
    this.initializeGame();
  }

  resetGameState() {
    // Clean up existing sprites
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites.clear();
    
    if (this.discardPileSprite) {
      this.discardPileSprite.destroy();
      this.discardPileSprite = null;
    }
    
    if (this.deckSprite) {
      this.deckSprite.destroy();
      this.deckSprite = null;
    }
    
    // Reset text references (they will be recreated in create())
    this.statusText = null;
    this.drawButton = null;
    
    // Reset game move manager
    this.gameMove = null;
  }

  initializeGame() {
    // Create GameMove instance
    this.gameMove = new GameMove();
    
    // Create a single-player game using GameMove
    const players = [{ id: this.playerId, name: "You" }];
    const ruleset = { cardsPerPlayer: 7 };
    
    // GameMove.createGame will handle deck creation, shuffling, and dealing
    this.gameMove.createGame(this.gameId, ruleset, players);
    
    // Update display
    this.updateDisplay();
  }

  updateDisplay() {
    if (!this.gameMove) return;

    // Get game state through GameMove
    const stateResult = this.gameMove.getGameState(this.gameId, this.playerId);
    
    if (!stateResult.success || !stateResult.gameState) {
      return;
    }

    const gameState = stateResult.gameState;
    const width = Number(this.game.config.width);
    const height = Number(this.game.config.height);

    // Check for winner using GameWinner
    const winnerResult = GameWinner.checkWinner(gameState);

    // Update status text
    if (this.statusText) {
      if (winnerResult) {
        this.statusText.setText(`You win！${winnerResult.message}`);
      } else if (gameState.gameOver) {
        this.statusText.setText("Game Over！");
      } else {
        this.statusText.setText(`Hand: ${gameState.myHand.length} cards | Deck: ${gameState.deckCount} cards`);
      }
    }

    // Update draw button visibility
    if (this.drawButton) {
      this.drawButton.setVisible(!gameState.gameOver);
    }

    // Clear existing card sprites
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites.clear();

    // Display player's hand at bottom
    this.displayHand(gameState.myHand, width * 0.5, height * 0.82);

    // Display discard pile in center
    if (gameState.discardTop) {
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
    if (this.discardPileSprite) {
      this.discardPileSprite.destroy();
    }
    this.discardPileSprite = this.createCardSprite(card, x, y, 1, false);
  }

  displayDeckCount(count: number, x: number, y: number) {
    if (this.deckSprite) {
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

    // Card rank
    const rankText = this.add.text(-20, -35, card.rank, {
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
    if (!this.gameMove) return false;
    
    const stateResult = this.gameMove.getGameState(this.gameId, this.playerId);
    return stateResult.success && stateResult.gameState?.gameOver || false;
  }

  handleDrawCard() {
    if (!this.gameMove || this.isGameOver()) {
      return;
    }

    // Use GameMove to handle drawing a card
    const result = this.gameMove.handleDrawCard(this.gameId, this.playerId);
    
    if (result.success) {
      this.updateDisplay();
    } else {
      // Handle error message
      if (this.statusText) {
        this.statusText.setText(result.message || "无法抽牌");
      }
    }
  }

  handlePlayCard(cardId: string) {
    if (!this.gameMove || this.isGameOver()) {
      return;
    }

    // Use GameMove to handle playing a card
    const result = this.gameMove.handlePlayCard(this.gameId, this.playerId, cardId);
    
    if (result.success) {
      this.updateDisplay();
      
      // Check for winner after playing card
      const stateResult = this.gameMove.getGameState(this.gameId, this.playerId);
      if (stateResult.success && stateResult.gameState) {
        const winnerResult = GameWinner.checkWinner(stateResult.gameState);
        if (winnerResult) {
          // Winner detected
          if (this.statusText) {
            this.statusText.setText(`You Win！${winnerResult.message}`);
          }
        }
      }
    } else {
      // Handle error message
      if (this.statusText) {
        this.statusText.setText(result.message || "Cannot play card");
      }
    }
  }
}
