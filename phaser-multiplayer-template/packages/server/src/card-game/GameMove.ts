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
        
        if (game.getDrawsThisTurn() < 1 && game.getPlayers()[0].getHand().length < 5) { // 5 is the max hand size for beta rules
            return game.drawCard(playerId);
        }

        else {
            return 0; // what should I return for a fail state here? Should I add a different check earlier?
        }
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
        
        if (game.getPlaysThisTurn() < 0) { // current beta rules don't allow for playing cards
            return game.playCard(playerId, cardId);
        }

        return 0; // what should I return for a fail state here?
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
        
        if (game.getDiscardsThisTurn() < 1) {
            return game.discardCard(playerId, cardId);
        }

        return 0; // what should I return for a fail state here?
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
