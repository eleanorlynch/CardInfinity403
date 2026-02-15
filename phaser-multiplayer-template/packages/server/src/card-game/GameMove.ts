import { GameStatus } from "./GameStatus.js";

// TODO: Once objects have been defined, replace the any datatypes with the object
export class GameMove {
    activeGames: Map<any, any>;
    constructor() {
        this.activeGames = new Map(); // Stores all ongoing games
    }
    
    // Create a new game
    createGame(gameId: number, ruleset: string[], players: any[]) {
        const game = new GameStatus(gameId, ruleset, players);
        this.activeGames.set(gameId, game);
        return game;
    }
    
    // Get a game by ID
    getGame(gameId: number) {
        return this.activeGames.get(gameId);
    }
    
    // Handle drawing a card
    handleDrawCard(gameId: number, playerId: number) {
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
    handlePlayCard(gameId: number, playerId: number, cardId: number) {
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
    handleDiscardCard(gameId: number, playerId: number, cardId: number) {
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
    getGameState(gameId: number, playerId: number) {
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
    endGame(gameId: number) {
        const wasDeleted = this.activeGames.delete(gameId);
        return {
            success: wasDeleted,
            message: wasDeleted ? "Game ended" : "Game not found"
        };
    }
}
