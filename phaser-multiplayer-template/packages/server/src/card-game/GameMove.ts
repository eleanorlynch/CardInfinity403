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

        if (game.whenToDraw === "startOfTurn" && (game.getPlaysThisTurn() > 0 || game.getDiscardsThisTurn() > 0)) {
            return {
                success: false,
                message: "User can only draw a card at the start of their turn, before playing or discarding any cards"
            }
        }
        else if (game.whenToDraw === "afterPlay" && game.getPlaysThisTurn() < game.minCardsToPlay) {
            return {
                success: false,
                message: `User must play at least ${game.minCardsToPlay} card(s) before drawing a card`
            }
        }
        else if (game.whenToDraw === "afterDiscard" && game.getDiscardsThisTurn() < game.minCardsToDiscard) {
            return {
                success: false,
                message: `User must discard at least ${game.minCardsToDiscard} card(s) before drawing a card`
            }
        }
        else if (game.whenToDraw === "endOfTurn" && (game.getPlaysThisTurn() < game.minCardsToPlay && game.getDiscardsThisTurn() < game.minCardsToDiscard)) {
            return {
                success: false,
                message: `User must play at least ${game.minCardsToPlay} card(s) and discard at least ${game.minCardsToDiscard} card(s) before drawing a card`
            }
        }
        else if (game.getDrawsThisTurn() >= game.maxCardsToDraw) {
           return { 
                success: false, 
                message: "User cannot draw any more cards this turn" 
            };
        }
        else if (game.getPlayers() !== undefined && game.getPlayers()[playerId] !== undefined && game.getPlayers()[playerId].getHand() !== undefined 
            && game.getPlayers()[playerId].getHand().length >= game.maxHandSize) {
            return { 
                success: false, 
                message: "User cannot draw any more cards this turn" 
            };
        }
        else {
            return game.drawCard(playerId);
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
        
        if (game.getPlaysThisTurn() < game.maxCardsToPlay) {
            if (game.whenToPlay === "afterDraw" && game.getDrawsThisTurn() < game.minCardsToDraw) {
                return {
                    success: false,
                    message: `User must draw at least ${game.minCardsToDraw} card(s) before playing a card`
                }
             }
             else if (game.whenToPlay === "beforeDraw" && game.getDrawsThisTurn() > 0) {
                return {
                    success: false,
                    message: "User cannot play a card after drawing a card this turn"
                }
             }
             else if (game.whenToPlay === "startOfTurn" && (game.getDrawsThisTurn() > 0 || game.getDiscardThisTurn > 0)) {
                return {
                    success: false,
                    message: "User can only play a card at the start of their turn, before drawing or discarding any cards"
                }
             }
             else if (game.whenToPlay === "afterDiscard" && game.getDiscardsThisTurn() < game.minCardsToDiscard) {
                return {
                    success: false,
                    message: `User must discard at least ${game.minCardsToDiscard} card(s) before playing a card`
                }
             }
             else if (game.getPlaysThisTurn() >= game.maxCardsToPlay) {
                return {
                    success: false,
                    message: `User cannot play more than ${game.maxCardsToPlay} card(s) this turn`
                }
             }
             else {
                const hand = game.getPlayers()[playerId].getHand();
                if (hand !== undefined) {
                    for (const card of hand) {
                        if (card.getId() === cardId) {
                            if (game.cardMustMatch !== "none" || game.cardMustNotMatch !== "none") {
                                if (game.cardMustMatch === "rank" && card.getRank() !== game.getTopDiscard().getRank()) {
                                    return { 
                                        success: false, 
                                        message: "Card does not match rank of top card" 
                                    };
                                }
                                else if (game.cardMustMatch === "suit" && card.getSuit() !== game.getTopDiscard().getSuit()) {
                                    return { 
                                        success: false,
                                        message: "Card does not match suit of top card"
                                    }
                                }
                                else if (game.cardMustMatch == "rankUp" && card.getRank() !== game.getTopDiscard().getRank() + 1) {
                                    return { 
                                        success: false,
                                        message: "Card does not match rank of top card + 1"
                                    }
                                }
                                else if (game.cardMustMatch == "rankDown" && card.getRank() !== game.getTopDiscard().getRank() - 1) {
                                    return { 
                                        success: false,
                                        message: "Card does not match rank of top card - 1"
                                    }
                                }
                                else if (game.cardMustMatch === "color" && ((card.getSuit() === "hearts" || card.getSuit() === "diamonds") && (game.getTopDiscard().getSuit() === "clubs" || game.getTopDiscard().getSuit() === "spades")) ||
                                        ((card.getSuit() === "clubs" || card.getSuit() === "spades") && (game.getTopDiscard().getSuit() === "hearts" || game.getTopDiscard().getSuit() === "diamonds"))) {
                                    return {
                                        success: false,
                                        message: "Card does not match color of top card"
                                    }
                                }
                                if (game.cardMustNotMatch === "rank" && card.getRank() === game.getTopDiscard().getRank()) {
                                    return { 
                                        success: false, 
                                        message: "Card cannot match rank of top card" 
                                    };
                                }
                                else if (game.cardMustNotMatch === "suit" && card.getSuit() === game.getTopDiscard().getSuit()) {
                                    return { 
                                        success: false,
                                        message: "Card cannot match suit of top card"
                                    }
                                }
                                else if (game.cardMustNotMatch === "rankUp" && card.getRank() === game.getTopDiscard().getRank() + 1) {
                                    return { 
                                        success: false,
                                        message: "Card cannot match rank of top card + 1"
                                    }
                                }
                                else if (game.cardMustNotMatch === "rankDown" && card.getRank() === game.getTopDiscard().getRank() - 1) {
                                    return { 
                                        success: false,
                                        message: "Card cannot match rank of top card - 1"
                                    }
                                }
                                else if (game.cardMustNotMatch === "color" && ((card.getSuit() === "hearts" || card.getSuit() === "diamonds") && (game.getTopDiscard().getSuit() === "hearts" || game.getTopDiscard().getSuit() === "diamonds")) ||
                                        ((card.getSuit() === "clubs" || card.getSuit() === "spades") && (game.getTopDiscard().getSuit() === "clubs" || game.getTopDiscard().getSuit() === "spades"))) {
                                    return {
                                        success: false,
                                        message: "Card cannot match color of top card"
                                    }
                                }
                            }
                            else {
                                return game.playCard(playerId, cardId);
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

        if (game.getCurrentTurn() !== playerId) {
            return {
                success: false,
                message: "Not your turn"
            };
        }

        if (game.whenToDiscard === "afterDraw" && game.getDrawsThisTurn() < game.minCardsToDraw) {
            return {
                success: false,
                message: `User must draw at least ${game.minCardsToDraw} card(s) before discarding a card`
            }
         }
        else if (game.whenToDiscard === "startOfTurn" && (game.getDrawsThisTurn() > 0 || game.getPlaysThisTurn() > 0)) {
            return {
                success: false,
                message: "User can only discard a card at the start of their turn, before drawing or playing any cards"
            };
        }
        else if (game.whenToDiscard === "afterPlay" && game.getPlaysThisTurn() < game.minCardsToPlay) {
            return {
                success: false,
                message: `User must play at least ${game.minCardsToPlay} card(s) before discarding a card`
            }
        }
        else if (game.whenToDiscard === "endOfTurn" && (game.getPlaysThisTurn() < game.minCardsToPlay && game.getDrawsThisTurn() < game.minCardsToDraw)) {
            return {
                success: false,
                message: `User must play at least ${game.minCardsToPlay} card(s) and draw at least ${game.minCardsToDraw} card(s) before discarding a card`
            }
        }
        else if (game.getDiscardsThisTurn() >= game.maxCardsToDiscard) {
            return {
                success: false,
                message: `User cannot discard more than ${game.maxCardsToDiscard} card(s) this turn`
            }
        }
        else if (game.getPlayerHand(playerId) !== undefined && game.getPlayerHand(playerId).length<= game.minHandSize) {
            return {
                success: false,
                message: `Minimum hand size is ${game.minHandSize}, user cannot discard any more cards`
            }
        }
        else {
            const hand = game.getPlayers()[playerId].getHand();
            if (hand !== undefined) {
                for (const card of hand) {
                    if (card.getId() === cardId) {
                        if (game.cardMustMatch !== "none" || game.cardMustNotMatch !== "none") {
                            if (game.cardMustMatch === "rank" && card.getRank() !== game.getTopDiscard().getRank()) {
                                return { 
                                    success: false, 
                                    message: "Card does not match rank of top card" 
                                };
                            }
                            else if (game.cardMustMatch === "suit" && card.getSuit() !== game.getTopDiscard().getSuit()) {
                                return { 
                                    success: false,
                                    message: "Card does not match suit of top card"
                                }
                            }
                            else if (game.cardMustMatch == "rankUp" && card.getRank() !== game.getTopDiscard().getRank() + 1) {
                                return { 
                                    success: false,
                                    message: "Card does not match rank of top card + 1"
                                }
                            }
                            else if (game.cardMustMatch == "rankDown" && card.getRank() !== game.getTopDiscard().getRank() - 1) {
                                return { 
                                    success: false,
                                    message: "Card does not match rank of top card - 1"
                                }
                            }
                            else if (game.cardMustMatch === "color" && ((card.getSuit() === "hearts" || card.getSuit() === "diamonds") && (game.getTopDiscard().getSuit() === "clubs" || game.getTopDiscard().getSuit() === "spades")) ||
                                    ((card.getSuit() === "clubs" || card.getSuit() === "spades") && (game.getTopDiscard().getSuit() === "hearts" || game.getTopDiscard().getSuit() === "diamonds"))) {
                                return {
                                    success: false,
                                    message: "Card does not match color of top card"
                                }
                            }
                            if (game.cardMustNotMatch === "rank" && card.getRank() === game.getTopDiscard().getRank()) {
                                return { 
                                    success: false, 
                                    message: "Card cannot match rank of top card" 
                                };
                            }
                            else if (game.cardMustNotMatch === "suit" && card.getSuit() === game.getTopDiscard().getSuit()) {
                                return { 
                                    success: false,
                                    message: "Card cannot match suit of top card"
                                }
                            }
                            else if (game.cardMustNotMatch === "rankUp" && card.getRank() === game.getTopDiscard().getRank() + 1) {
                                return { 
                                    success: false,
                                    message: "Card cannot match rank of top card + 1"
                                }
                            }
                            else if (game.cardMustNotMatch === "rankDown" && card.getRank() === game.getTopDiscard().getRank() - 1) {
                                return { 
                                    success: false,
                                    message: "Card cannot match rank of top card - 1"
                                }
                            }
                            else if (game.cardMustNotMatch === "color" && ((card.getSuit() === "hearts" || card.getSuit() === "diamonds") && (game.getTopDiscard().getSuit() === "hearts" || game.getTopDiscard().getSuit() === "diamonds")) ||
                                    ((card.getSuit() === "clubs" || card.getSuit() === "spades") && (game.getTopDiscard().getSuit() === "clubs" || game.getTopDiscard().getSuit() === "spades"))) {
                                return {
                                    success: false,
                                    message: "Card cannot match color of top card"
                                }
                            }
                        }
                        else {
                            return game.playCard(playerId, cardId);
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
