import { GameStatus } from "./GameStatus";
import { Card } from "./Card";
import e from "express";

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

    // TODO: Implement usage of this function in the frontend
    handleEndTurn(gameId: number, playerId: number) {
        const game = this.activeGames.get(gameId);
        if (!game) {
            return { 
                success: false, 
                message: "Game not found" 
            };
        }
        if (game.getPlaysThisTurn() < game.playRules.minCardsToPlay) {
            return {
                success: false,
                message: `User must play at least ${game.playRules.minCardsToPlay} card(s) before ending their turn`
            };
        }
        else if (game.getDrawsThisTurn() < game.drawRules.minCardsToDraw) {
            return {
                success: false,
                message: `User must draw at least ${game.drawRules.minCardsToDraw} card(s) before ending their turn`
            };
        }
        else if (game.getDiscardsThisTurn() < game.discardRules.minCardsToDiscard) {
            return {
                success: false,
                message: `User must discard at least ${game.discardRules.minCardsToDiscard} card(s) before ending their turn`
            };
        }
        game.nextTurn();
        return { 
            success: true, 
            message: "Turn ended" 
        };
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

        if (game.drawRules.whenToDraw === "startOfTurn" && (game.getPlaysThisTurn() > 0 || game.getDiscardsThisTurn() > 0)) {
            return {
                success: false,
                message: "User can only draw a card at the start of their turn, before playing or discarding any cards"
            }
        }
        else if (game.drawRules.whenToDraw === "afterPlay" && game.getPlaysThisTurn() < game.playRules.minCardsToPlay) {
            return {
                success: false,
                message: `User must play at least ${game.minCardsToPlay} card(s) before drawing a card`
            }
        }
        else if (game.drawRules.whenToDraw === "afterDiscard" && game.getDiscardsThisTurn() < game.discardRules.minCardsToDiscard) {
            return {
                success: false,
                message: `User must discard at least ${game.discardRules.minCardsToDiscard} card(s) before drawing a card`
            }
        }
        else if (game.drawRules.whenToDraw === "endOfTurn" && (game.getPlaysThisTurn() < game.playRules.minCardsToPlay && game.getDiscardsThisTurn() < game.discardRules.minCardsToDiscard)) {
            return {
                success: false,
                message: `User must play at least ${game.playRules.minCardsToPlay} card(s) and discard at least ${game.discardRules.minCardsToDiscard} card(s) before drawing a card`
            }
        }
        else if (game.getDrawsThisTurn() >= game.drawRules.maxCardsToDraw) {
           return { 
                success: false, 
                message: "User cannot draw any more cards this turn" 
            };
        }
        else if (game.getPlayers() !== undefined && game.getPlayers()[playerId] !== undefined && game.getPlayers()[playerId].getHand() !== undefined 
            && game.getPlayers()[playerId].getHand().length >= game.handRules.maxHandSize) {
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

        if (game.getCurrentTurn() !== playerId) {
            return {
                success: false,
                message: "Not your turn"
            };
        }
        
        if (game.getPlaysThisTurn() < game.maxCardsToPlay) {
            if (game.playRules.whenToPlay === "afterDraw" && game.getDrawsThisTurn() < game.drawRules.minCardsToDraw) {
                return {
                    success: false,
                    message: `User must draw at least ${game.drawRules.minCardsToDraw} card(s) before playing a card`
                }
             }
             else if (game.playRules.whenToPlay === "beforeDraw" && game.getDrawsThisTurn() > 0) {
                return {
                    success: false,
                    message: "User cannot play a card after drawing a card this turn"
                }
             }
             else if (game.playRules.whenToPlay === "startOfTurn" && (game.getDrawsThisTurn() > 0 || game.getDiscardThisTurn() > 0)) {
                return {
                    success: false,
                    message: "User can only play a card at the start of their turn, before drawing or discarding any cards"
                }
             }
             else if (game.playRules.whenToPlay === "afterDiscard" && game.getDiscardsThisTurn() < game.discardRules.minCardsToDiscard) {
                return {
                    success: false,
                    message: `User must discard at least ${game.discardRules.minCardsToDiscard} card(s) before playing a card`
                }
             }
             else if (game.getPlaysThisTurn() >= game.playRules.maxCardsToPlay) {
                return {
                    success: false,
                    message: `User cannot play more than ${game.playRules.maxCardsToPlay} card(s) this turn`
                }
             }
             else {
                const hand = game.getPlayers()[playerId].getHand();
                if (hand !== undefined) {
                    for (const card of hand) {
                        if (card.getId() === cardId) {
                            if (game.playRules.cardMustMatch !== "none" || game.playRules.cardMustNotMatch !== "none") {
                                if (game.playRules.cardMustMatch === "rank" && card.getRank() !== game.getTopDiscard().getRank()) {
                                    return { 
                                        success: false, 
                                        message: "Card does not match rank of top card" 
                                    };
                                }
                                else if (game.playRules.cardMustMatch === "suit" && card.getSuit() !== game.getTopDiscard().getSuit()) {
                                    return { 
                                        success: false,
                                        message: "Card does not match suit of top card"
                                    }
                                }
                                else if (game.playRules.cardMustMatch === "rankUp" && card.getRank() !== game.getTopDiscard().getRank() + 1) {
                                    return { 
                                        success: false,
                                        message: "Card does not match rank of top card + 1"
                                    }
                                }
                                else if (game.playRules.cardMustMatch === "rankDown" && card.getRank() !== game.getTopDiscard().getRank() - 1) {
                                    return { 
                                        success: false,
                                        message: "Card does not match rank of top card - 1"
                                    }
                                }
                                else if (game.playRules.cardMustMatch === "color" && ((card.getSuit() === "hearts" || card.getSuit() === "diamonds") && (game.getTopDiscard().getSuit() === "clubs" || game.getTopDiscard().getSuit() === "spades")) ||
                                        ((card.getSuit() === "clubs" || card.getSuit() === "spades") && (game.getTopDiscard().getSuit() === "hearts" || game.getTopDiscard().getSuit() === "diamonds"))) {
                                    return {
                                        success: false,
                                        message: "Card does not match color of top card"
                                    }
                                }
                                if (game.playRules.cardMustNotMatch === "rank" && card.getRank() === game.getTopDiscard().getRank()) {
                                    return { 
                                        success: false, 
                                        message: "Card cannot match rank of top card" 
                                    };
                                }
                                else if (game.playRules.cardMustNotMatch === "suit" && card.getSuit() === game.getTopDiscard().getSuit()) {
                                    return { 
                                        success: false,
                                        message: "Card cannot match suit of top card"
                                    }
                                }
                                else if (game.playRules.cardMustNotMatch === "rankUp" && card.getRank() === game.getTopDiscard().getRank() + 1) {
                                    return { 
                                        success: false,
                                        message: "Card cannot match rank of top card + 1"
                                    }
                                }
                                else if (game.playRules.cardMustNotMatch === "rankDown" && card.getRank() === game.getTopDiscard().getRank() - 1) {
                                    return { 
                                        success: false,
                                        message: "Card cannot match rank of top card - 1"
                                    }
                                }
                                else if (game.playRules.cardMustNotMatch === "color" && ((card.getSuit() === "hearts" || card.getSuit() === "diamonds") && (game.getTopDiscard().getSuit() === "hearts" || game.getTopDiscard().getSuit() === "diamonds")) ||
                                        ((card.getSuit() === "clubs" || card.getSuit() === "spades") && (game.getTopDiscard().getSuit() === "clubs" || game.getTopDiscard().getSuit() === "spades"))) {
                                    return {
                                        success: false,
                                        message: "Card cannot match color of top card"
                                    }
                                }
                            }
                            else { 
                                var isSpecial = false;
                                var ability = "";
                                for (const specialCard in game.cardAbilities.specialCards) {
                                    if (specialCard.rank === card.getRank() && specialCard.suit === card.getSuit()) {
                                        isSpecial = true;
                                        ability = specialCard.ability;
                                        break;
                                    }
                                }
                                if (isSpecial) {
                                    if (ability === "skipNextPlayer" && game.cardAbilities.skipNextPlayer.activatesOn === "play") {
                                        game.cardAbilities.skipNextPlayer = true; // TODO: Add this global variable to GameStatus.ts and add behavior for it
                                    }
                                    else if (ability === "reverseTurnOrder") {
                                        game.reverseTurnOrder(); // TODO: Add this function to GameStatus.ts
                                    }
                                    else if (ability === "drawCardsForNextPlayer" && game.cardAbilities.drawCardsForNextPlayer.activatesOn === "play") {
                                        for (let i = 0; i < game.cardAbilities.drawCardsForNextPlayer.numCards; i++) {
                                            if (game.getPlayers() !== undefined && game.getPlayers()[(playerId + 1) % game.getPlayers().length] !== undefined
                                                && game.getPlayers()[(playerId + 1) % game.getPlayers().length].getHand() !== undefined
                                                && game.getPlayers()[(playerId + 1) % game.getPlayers().length].getHand().length < game.handRules.maxHandSize) {
                                                game.drawCard((playerId + 1) % game.getPlayers().length);
                                            }
                                        }
                                    }
                                    else if (ability === "extraTurn") {
                                        game.extraTurn = true; // TODO: Add this global variable to GameStatus.ts and add behavior for it
                                    }
                                    else if (ability === "extraDraw") {
                                        game.drawsThisTurn = game.drawsThisTurn - 1;
                                    }
                                    else if (ability === "extraPlay") {
                                        game.playsThisTurn = game.playsThisTurn - 1;
                                    }
                                    else if (ability === "extraDiscard") {
                                        game.discardsThisTurn = game.discardsThisTurn - 1;
                                    }
                                }
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

        if (game.discardRules.whenToDiscard === "afterDraw" && game.getDrawsThisTurn() < game.drawRules.minCardsToDraw) {
            return {
                success: false,
                message: `User must draw at least ${game.drawRules.minCardsToDraw} card(s) before discarding a card`
            }
         }
        else if (game.discardRules.whenToDiscard === "startOfTurn" && (game.getDrawsThisTurn() > 0 || game.getPlaysThisTurn() > 0)) {
            return {
                success: false,
                message: "User can only discard a card at the start of their turn, before drawing or playing any cards"
            };
        }
        else if (game.discardRules.whenToDiscard === "afterPlay" && game.getPlaysThisTurn() < game.playRules.minCardsToPlay) {
            return {
                success: false,
                message: `User must play at least ${game.playRules.minCardsToPlay} card(s) before discarding a card`
            }
        }
        else if (game.discardRules.whenToDiscard === "endOfTurn" && (game.getPlaysThisTurn() < game.playRules.minCardsToPlay && game.getDrawsThisTurn() < game.drawRules.minCardsToDraw)) {
            return {
                success: false,
                message: `User must play at least ${game.playRules.minCardsToPlay} card(s) and draw at least ${game.drawRules.minCardsToDraw} card(s) before discarding a card`
            }
        }
        else if (game.getDiscardsThisTurn() >= game.discardRules.maxCardsToDiscard) {
            return {
                success: false,
                message: `User cannot discard more than ${game.discardRules.maxCardsToDiscard} card(s) this turn`
            }
        }
        else if (game.getPlayerHand(playerId) !== undefined && game.getPlayerHand(playerId).length<= game.handRules.minHandSize) {
            return {
                success: false,
                message: `Minimum hand size is ${game.handRules.minHandSize}, user cannot discard any more cards`
            }
        }
        else {
            const hand = game.getPlayers()[playerId].getHand();
            if (hand !== undefined) {
                for (const card of hand) {
                    if (card.getId() === cardId) {
                        if (game.discardRules.cardMustMatch !== "none" || game.discardRules.cardMustNotMatch !== "none") {
                            if (game.discardRules.cardMustMatch === "rank" && card.getRank() !== game.getTopDiscard().getRank()) {
                                return { 
                                    success: false, 
                                    message: "Card does not match rank of top card" 
                                };
                            }
                            else if (game.discardRules.cardMustMatch === "suit" && card.getSuit() !== game.getTopDiscard().getSuit()) {
                                return { 
                                    success: false,
                                    message: "Card does not match suit of top card"
                                }
                            }
                            else if (game.discardRules.cardMustMatch === "rankUp" && card.getRank() !== game.getTopDiscard().getRank() + 1) {
                                return { 
                                    success: false,
                                    message: "Card does not match rank of top card + 1"
                                }
                            }
                            else if (game.discardRules.cardMustMatch === "rankDown" && card.getRank() !== game.getTopDiscard().getRank() - 1) {
                                return { 
                                    success: false,
                                    message: "Card does not match rank of top card - 1"
                                }
                            }
                            else if (game.discardRules.cardMustMatch === "color" && ((card.getSuit() === "hearts" || card.getSuit() === "diamonds") && (game.getTopDiscard().getSuit() === "clubs" || game.getTopDiscard().getSuit() === "spades")) ||
                                    ((card.getSuit() === "clubs" || card.getSuit() === "spades") && (game.getTopDiscard().getSuit() === "hearts" || game.getTopDiscard().getSuit() === "diamonds"))) {
                                return {
                                    success: false,
                                    message: "Card does not match color of top card"
                                }
                            }
                            if (game.discardRules.cardMustNotMatch === "rank" && card.getRank() === game.getTopDiscard().getRank()) {
                                return { 
                                    success: false, 
                                    message: "Card cannot match rank of top card" 
                                };
                            }
                            else if (game.discardRules.cardMustNotMatch === "suit" && card.getSuit() === game.getTopDiscard().getSuit()) {
                                return { 
                                    success: false,
                                    message: "Card cannot match suit of top card"
                                }
                            }
                            else if (game.discardRules.cardMustNotMatch === "rankUp" && card.getRank() === game.getTopDiscard().getRank() + 1) {
                                return { 
                                    success: false,
                                    message: "Card cannot match rank of top card + 1"
                                }
                            }
                            else if (game.discardRules.cardMustNotMatch === "rankDown" && card.getRank() === game.getTopDiscard().getRank() - 1) {
                                return { 
                                    success: false,
                                    message: "Card cannot match rank of top card - 1"
                                }
                            }
                            else if (game.discardRules.cardMustNotMatch === "color" && ((card.getSuit() === "hearts" || card.getSuit() === "diamonds") && (game.getTopDiscard().getSuit() === "hearts" || game.getTopDiscard().getSuit() === "diamonds")) ||
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
