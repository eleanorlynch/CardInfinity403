import { GameStatus } from "./GameStatus";
import { Card } from "./Card";

// TODO: Once objects have been defined, replace the any datatypes with the object
export class GameMove {
    activeGames: Map<any, any>;
    constructor() {
        this.activeGames = new Map(); // Stores all ongoing games
    }
    
    // Create a new game
    createGame(gameId: number, ruleset: string[], players: any[]) {
        const game = new GameStatus(gameId, ruleset, players);

        //initialize deck + shuffle + initial deal
        game.createDeck();
        game.shuffleDeck();
        game.dealCards();

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

        if (game.getCurrentTurn() !== playerId) {
            return {
                success: false,
                message: "Not your turn"
            };
        }
        
        if (game.getDrawsThisTurn() < 1) { // uno lets you either draw or play once per turn
           // if (game.getPlayers()[playerId].getHand().length < 4) { // current beta ruleset has no hand size limit
           if (game.getPlaysThisTurn() < 1) {
                return game.drawCard(playerId);
            }  
           else {
                return { 
                    success: false, 
                    message: "User cannot both play and draw a card in the same turn" 
                };
            }
           // }
           /* else {
                return { 
                    success: false, 
                    message: "User cannot draw more cards, hand size limit reached" 
                };
            } */
        }

        else {
            return { 
                success: false, 
                message: "User cannot draw any more cards this turn" 
            };
        }
    }
    
    // Handle playing a card
    handlePlayCard(gameId: number, playerId: number, cardId: string) {
        const game = this.activeGames.get(gameId);
        
        if (!game) {
            return { 
                success: false, 
                message: "Game not found" 
            };
        }
        
        if (game.getPlaysThisTurn() < 1) { // current beta rules allow for either playing or drawing once per turn
            if (game.getDrawsThisTurn() < 1) {
                const hand = game.getPlayers()[playerId].getHand();
                if (hand !== undefined) {
                    for (const card of hand) {
                        if (card.getId() === cardId) {
                            if (card.getRank() === game.getTopDiscard().getRank() || card.getSuit() === game.getTopDiscard().getSuit()) {
                                return game.playCard(playerId, cardId);
                            }
                            else {
                                return { 
                                    success: false, 
                                    message: "Card does not match rank or suit of top card" 
                                };
                            }
                        }
                    }
                    return {
                        success: false,
                        message: "Card not found in player's hand"
                    };
                }
                return {
                    success: false,
                    message: "Player hand not found"
                };
            }
            return {
                success: false,
                message: "User cannot both play and draw a card in the same turn"
            }
        }

        return { 
                success: false, 
                message: "User cannot play any more cards this turn" 
            };
    }
    
    // Handle discarding a card
    handleDiscardCard(gameId: number, playerId: number, cardId: string) {
        const game = this.activeGames.get(gameId);
        
        if (!game) {
            return { 
                success: false, 
                message: "Game not found" 
            };
        }
        
        if (game.getDiscardsThisTurn() < 1) {
            if (game.getDrawsThisTurn() >= 1) { // haven't discarded yet and have drawn a card to start your turn
                return game.discardCard(playerId, cardId);
            }
            return { 
                success: false, 
                message: "User has not yet drawn a card this turn" 
            };
        }

        return { 
                success: false, 
                message: "User cannot discard any more cards this turn" 
            };
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
