import { GameStatus } from "./GameStatus.js";

export class GameMove {
    constructor() {
        this.activeGames = new Map(); // Stores all ongoing games
    }
    
    // Create a new game
    createGame(gameId, ruleset, players) {
        const game = new GameStatus(gameId, ruleset, players);
        
        // Initialize deck and deal cards
        game.createDeck();
        game.shuffleDeck();
        game.dealCards();
        
        // Put first card on discard pile
        if (game.getDeckCount() > 0) {
            const firstCard = game.deck.pop();
            if (firstCard) {
                game.discardPile.push(firstCard);
            }
        }
        
        this.activeGames.set(gameId, game);
        return game;
    }
    
    // Get a game by ID
    getGame(gameId) {
        return this.activeGames.get(gameId);
    }
    
    // Handle drawing a card
    handleDrawCard(gameId, playerId) {
        const game = this.activeGames.get(gameId);
        
        if (!game) {
            return { 
                success: false, 
                message: "Game not found" 
            };
        }
        
        return game.drawCard(playerId);
    }
    
    // Handle playing a card
    handlePlayCard(gameId, playerId, cardId) {
        const game = this.activeGames.get(gameId);
        
        if (!game) {
            return { 
                success: false, 
                message: "Game not found" 
            };
        }
        
        return game.playCard(playerId, cardId);
    }
    
    // Handle discarding a card
    handleDiscardCard(gameId, playerId, cardId) {
        const game = this.activeGames.get(gameId);
        
        if (!game) {
            return { 
                success: false, 
                message: "Game not found" 
            };
        }
        
        return game.discardCard(playerId, cardId);
    }
    
    // Get game state for a player
    getGameState(gameId, playerId) {
        const game = this.activeGames.get(gameId);
        
        if (!game) {
            return { 
                success: false, 
                message: "Game not found" 
            };
        }
        
        return {
            success: true,
            gameState: game.getGameState(playerId)
        };
    }
    
    // End a game
    endGame(gameId) {
        const wasDeleted = this.activeGames.delete(gameId);
        return {
            success: wasDeleted,
            message: wasDeleted ? "Game ended" : "Game not found"
        };
    }
}
