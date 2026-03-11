import { GameStatus } from "./GameStatus";
import { loadDefaultRuleset } from "./loadRuleset";
import * as rulesetDb from "../rulesetDb";
import type { Ruleset } from "./RulesetTypes";

export class GameMove {
    activeGames: Map<any, any>;
    constructor() {
        // Stores all ongoing games
        this.activeGames = new Map();
    }
    
    // Create a new game. rulesetId: optional saved ruleset id; if omitted, uses default Ruleset.json template.
    async createGame(gameId: number, players: any[], rulesetId?: number): Promise<GameStatus> {
        let ruleset: Ruleset;

        if (rulesetId != null) {
            const row = await rulesetDb.getRulesetById(rulesetId);
            if (!row) throw new Error(`Ruleset ${rulesetId} not found`);
            ruleset = row.data;
        } else {
            ruleset = loadDefaultRuleset();
        }

        const game = new GameStatus(gameId, ruleset, players);

        // initialize deck + shuffle + initial deal
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

    /** Restore a game from a saved session (e.g. from current_session table). */
    setGame(gameId: number, game: GameStatus): void {
        this.activeGames.set(gameId, game);
    }

    // TODO: Make sure to test this function especially
    handleEndTurn(gameId: number, playerId: number) {
        const game = this.activeGames.get(gameId);

        if (game === undefined || game === null) {
            return { 
                success: false, 
                message: "Game not found" 
            };
        }

        // player hasn't played the minimum number of cards required this turn
        if (game.getPlaysThisTurn() < game.playRules.minCardsToPlay) {
            return {
                success: false,
                message: `User must play at least ${game.playRules.minCardsToPlay} card(s) before ending their turn`
            };
        } 
        // player hasn't drawn the minimum number of cards required this turn
        else if (game.getDrawsThisTurn() < game.drawRules.minCardsToDraw) {
            return {
                success: false,
                message: `User must draw at least ${game.drawRules.minCardsToDraw} card(s) before ending their turn`
            };
        }
        // player hasn't discarded the minimum number of cards required this turn
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
        
        if (game === undefined || game === null) {
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

        // player can only draw card(s) at the start of their turn before playing or discarding any cards if this rule is in effect
        if (game.drawRules.whenToDraw === "startOfTurn" && (game.getPlaysThisTurn() > 0 || game.getDiscardsThisTurn() > 0)) {
            return {
                success: false,
                message: "User can only draw a card at the start of their turn, before playing or discarding any cards"
            }
        }
        // player can only draw card(s) after playing the minimum number of cards required this turn if this rule is in effect
        else if (game.drawRules.whenToDraw === "afterPlay" && game.getPlaysThisTurn() < game.playRules.minCardsToPlay) {
            return {
                success: false,
                message: `User must play at least ${game.playRules.minCardsToPlay} card(s) before drawing a card`
            }
        }
        // player can only draw card(s) after discarding the minimum number of cards required this turn if this rule is in effect
        else if (game.drawRules.whenToDraw === "afterDiscard" && game.getDiscardsThisTurn() < game.discardRules.minCardsToDiscard) {
            return {
                success: false,
                message: `User must discard at least ${game.discardRules.minCardsToDiscard} card(s) before drawing a card`
            }
        }
        // player can only draw card(s) at the end of their turn after playing and discarding the minimum number of cards required this turn if this rule is in effect
        else if (game.drawRules.whenToDraw === "endOfTurn" && (game.getPlaysThisTurn() < game.playRules.minCardsToPlay && game.getDiscardsThisTurn() < game.discardRules.minCardsToDiscard)) {
            return {
                success: false,
                message: `User must play at least ${game.playRules.minCardsToPlay} card(s) and discard at least ${game.discardRules.minCardsToDiscard} card(s) before drawing a card`
            }
        }
        // player has already drawn the maximum number of cards allowed this turn
        else if (game.getDrawsThisTurn() >= game.drawRules.maxCardsToDraw) {
           return { 
                success: false, 
                message: "User cannot draw any more cards this turn" 
            };
        }
        // player already has the maximum number of cards allowed in their hand, so they can't draw any more cards
        else if (game.getPlayers() !== undefined && game.getPlayers()[playerId] !== undefined && game.getPlayers()[playerId].getHand() !== undefined 
            && game.getPlayers()[playerId].getHand().length >= game.handRules.maxHandSize) {
            return { 
                success: false, 
                message: "User cannot draw more cards, hand size limit reached" 
            };
        }

        // all rules have been satisfied, draw the card
        return game.drawCard(playerId);
    }
    
    // Handle playing a card
    handlePlayCard(gameId: number, playerId: number, cardId: string) {
        const game = this.activeGames.get(gameId);
        
        if (game === undefined || game === null) {
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
        
        // player can only play card(s) if they haven't already played the maximum number of cards allowed this turn
        if (game.getPlaysThisTurn() < game.playRules.maxCardsToPlay) {
            // player can only play cards(s) after drawing the minimum number this turn
            if (game.playRules.whenToPlay === "afterDraw" && game.getDrawsThisTurn() < game.drawRules.minCardsToDraw) {
                return {
                    success: false,
                    message: `User must draw at least ${game.drawRules.minCardsToDraw} card(s) before playing a card`
                }
             }
             // player can only play card(s) before drawing any cards this turn if this rule is in effect
             else if (game.playRules.whenToPlay === "beforeDraw" && game.getDrawsThisTurn() > 0) {
                return {
                    success: false,
                    message: "User cannot play a card after drawing a card this turn"
                }
             }
             // player can only play card(s) at the start of their turn before drawing or discarding any cards if this rule is in effect
             else if (game.playRules.whenToPlay === "startOfTurn" && (game.getDrawsThisTurn() > 0 || game.getDiscardsThisTurn() > 0)) {
                return {
                    success: false,
                    message: "User can only play a card at the start of their turn, before drawing or discarding any cards"
                }
             }
             // player can only play card(s) after discarding the minimum number of cards required this turn if this rule is in effect
             else if (game.playRules.whenToPlay === "afterDiscard" && game.getDiscardsThisTurn() < game.discardRules.minCardsToDiscard) {
                return {
                    success: false,
                    message: `User must discard at least ${game.discardRules.minCardsToDiscard} card(s) before playing a card`
                }
             }
             // player has already played the maximum number of cards allowed this turn
             else if (game.getPlaysThisTurn() >= game.playRules.maxCardsToPlay) {
                return {
                    success: false,
                    message: `User cannot play more than ${game.playRules.maxCardsToPlay} card(s) this turn`
                }
             } else {
                const hand = game.getPlayers()[playerId].getHand();

                if (hand !== undefined) {

                    for (const card of hand) {

                        // finds the card in the player's hand based on its cardId
                        if (card.getId() === cardId) {
                            var isSpecial = false;
                            var ability = "";

                            // checks if the card has a special ability when played
                            for (const specialCard of game.cardAbilities.specialCards.cards) {

                                if (specialCard.rank === card.getRank() && specialCard.suit === card.getSuit() && specialCard.activatesOn === "play") {
                                    isSpecial = true;
                                    ability = specialCard.ability;
                                    break;
                                }
                            }

                            // wild cards can be played even if they don't follow the matching rules
                            if (ability === "wildCard") {
                                return game.playCard(playerId, cardId);
                            }

                            // there are some rules related to matching
                            if (game.playRules.cardMustMatch !== "none" || game.playRules.cardMustNotMatch !== "none") {

                                // doesn't match rank of top card when it should
                                if (game.playRules.cardMustMatch === "rank" && card.getRank() !== game.getTopDiscard().getRank()) {
                                    return { 
                                        success: false, 
                                        message: "Card does not match rank of top card" 
                                    };
                                }
                                // doesn't match suit of top card when it should
                                else if (game.playRules.cardMustMatch === "suit" && card.getSuit() !== game.getTopDiscard().getSuit()) {
                                    return { 
                                        success: false,
                                        message: "Card does not match suit of top card"
                                    }
                                }
                                // doesn't match rank of top card plus one when it should
                                else if (game.playRules.cardMustMatch === "rankUp" && card.getRank() !== game.getTopDiscard().getRank() + 1) {
                                    return { 
                                        success: false,
                                        message: "Card does not match rank of top card + 1"
                                    }
                                }
                                // doesn't match rank of top card minus one when it should
                                else if (game.playRules.cardMustMatch === "rankDown" && card.getRank() !== game.getTopDiscard().getRank() - 1) {
                                    return { 
                                        success: false,
                                        message: "Card does not match rank of top card - 1"
                                    }
                                }
                                // doesn't match color of top card when it should
                                else if (game.playRules.cardMustMatch === "color" && ((card.getSuit() === "hearts" || card.getSuit() === "diamonds") && (game.getTopDiscard().getSuit() === "clubs" || game.getTopDiscard().getSuit() === "spades")) ||
                                        ((card.getSuit() === "clubs" || card.getSuit() === "spades") && (game.getTopDiscard().getSuit() === "hearts" || game.getTopDiscard().getSuit() === "diamonds"))) {
                                    return {
                                        success: false,
                                        message: "Card does not match color of top card"
                                    }
                                }

                                // matches rank of top card when it shouldn't
                                if (game.playRules.cardMustNotMatch === "rank" && card.getRank() === game.getTopDiscard().getRank()) {
                                    return { 
                                        success: false, 
                                        message: "Card cannot match rank of top card" 
                                    };
                                }
                                // matches suit of top card when it shouldn't
                                else if (game.playRules.cardMustNotMatch === "suit" && card.getSuit() === game.getTopDiscard().getSuit()) {
                                    return { 
                                        success: false,
                                        message: "Card cannot match suit of top card"
                                    }
                                }
                                // matches rank of top card plus one when it shouldn't
                                else if (game.playRules.cardMustNotMatch === "rankUp" && card.getRank() === game.getTopDiscard().getRank() + 1) {
                                    return { 
                                        success: false,
                                        message: "Card cannot match rank of top card + 1"
                                    }
                                }
                                // matches rank of top card minus one when it shouldn't
                                else if (game.playRules.cardMustNotMatch === "rankDown" && card.getRank() === game.getTopDiscard().getRank() - 1) {
                                    return { 
                                        success: false,
                                        message: "Card cannot match rank of top card - 1"
                                    }
                                }
                                // matches color of top card when it shouldn't
                                else if (game.playRules.cardMustNotMatch === "color" && ((card.getSuit() === "hearts" || card.getSuit() === "diamonds") && (game.getTopDiscard().getSuit() === "hearts" || game.getTopDiscard().getSuit() === "diamonds")) ||
                                        ((card.getSuit() === "clubs" || card.getSuit() === "spades") && (game.getTopDiscard().getSuit() === "clubs" || game.getTopDiscard().getSuit() === "spades"))) {
                                    return {
                                        success: false,
                                        message: "Card cannot match color of top card"
                                    }
                                }
                            } else { 
                                // card has a special ability that activates when played
                                if (isSpecial) {

                                    if (ability === "skipNextPlayer") {
                                        game.skipNextPlayer = true;
                                    } else if (ability === "reverseTurnOrder") {

                                        if (game.reverseTurnOrder === true) {
                                            game.reverseTurnOrder = false;
                                        } else {
                                            game.reverseTurnOrder = true;
                                        }
                                    }
                                    // next player in the turn order draws some specified number of cards
                                    else if (ability === "drawCardsForNextPlayer") {
                                        for (let i = 0; i < game.cardAbilities.drawCardsForNextPlayer.numDraws; i++) {
                                            if (game.getPlayers() !== undefined && game.getPlayers()[(playerId + 1) % game.getPlayers().length] !== undefined
                                                && game.getPlayers()[(playerId + 1) % game.getPlayers().length].getHand() !== undefined
                                                && game.getPlayers()[(playerId + 1) % game.getPlayers().length].getHand().length < game.handRules.maxHandSize) {
                                                game.drawCard((playerId + 1) % game.getPlayers().length);
                                            }
                                        }
                                    }
                                    // players takes an extra turn immediately after this one
                                    else if (ability === "extraTurn") {
                                        game.extraTurn = true;
                                    }
                                    // player can draw an extra card this turn
                                    else if (ability === "extraDraw") {
                                        game.drawsThisTurn = game.drawsThisTurn - 1;
                                    }
                                    // player can play an extra card this turn
                                    else if (ability === "extraPlay") {
                                        game.playsThisTurn = game.playsThisTurn - 1;
                                    }
                                    // player can discard an extra card this turn
                                    else if (ability === "extraDiscard") {
                                        game.discardsThisTurn = game.discardsThisTurn - 1;
                                    }
                                }

                                // all rules have been satisfied, play the card
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
        
        if (game === undefined || game === null) {
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

        // player can only discard card(s) after drawing the minimum number of cards required this turn if this rule is in effect
        if (game.discardRules.whenToDiscard === "afterDraw" && game.getDrawsThisTurn() < game.drawRules.minCardsToDraw) {
            return {
                success: false,
                message: `User must draw at least ${game.drawRules.minCardsToDraw} card(s) before discarding a card`
            }
        }
        // player can only discard card(s) at the start of their turn before drawing or playing any cards if this rule is in effect
        else if (game.discardRules.whenToDiscard === "startOfTurn" && (game.getDrawsThisTurn() > 0 || game.getPlaysThisTurn() > 0)) {
            return {
                success: false,
                message: "User can only discard a card at the start of their turn, before drawing or playing any cards"
            };
        }
        // player can only discard card(s) after playing the minimum number of cards required this turn if this rule is in effect
        else if (game.discardRules.whenToDiscard === "afterPlay" && game.getPlaysThisTurn() < game.playRules.minCardsToPlay) {
            return {
                success: false,
                message: `User must play at least ${game.playRules.minCardsToPlay} card(s) before discarding a card`
            }
        }
        // player can only discard card(s) at the end of their turn after playing and drawing the minimum number of cards required this turn if this rule is in effect
        else if (game.discardRules.whenToDiscard === "endOfTurn" && (game.getPlaysThisTurn() < game.playRules.minCardsToPlay && game.getDrawsThisTurn() < game.drawRules.minCardsToDraw)) { 
            return {
                success: false,
                message: `User must play at least ${game.playRules.minCardsToPlay} card(s) and draw at least ${game.drawRules.minCardsToDraw} card(s) before discarding a card`
            }
        }
        // player has already discarded the maximum number of cards allowed this turn
        else if (game.getDiscardsThisTurn() >= game.discardRules.maxCardsToDiscard) {
            return {
                success: false,
                message: `User cannot discard more than ${game.discardRules.maxCardsToDiscard} card(s) this turn`
            }
        }
        // player already has the minimum number of cards allowed in their hand, so they can't discard any more cards
        else if (game.getPlayerHand(playerId) !== undefined && game.getPlayerHand(playerId).length<= game.handRules.minHandSize) {
            return {
                success: false,
                message: `Minimum hand size is ${game.handRules.minHandSize}, user cannot discard any more cards`
            }
        } else {
            const hand = game.getPlayers()[playerId].getHand();

            if (hand !== undefined) {

                for (const card of hand) {

                    // finds the card in the player's hand based on its cardId
                    if (card.getId() === cardId) {

                        // there are some rules related to matching
                        if (game.discardRules.cardMustMatch !== "none" || game.discardRules.cardMustNotMatch !== "none") {

                            // doesn't match rank of top card when it should
                            if (game.discardRules.cardMustMatch === "rank" && card.getRank() !== game.getTopDiscard().getRank()) {
                                return { 
                                    success: false, 
                                    message: "Card does not match rank of top card" 
                                };
                            }
                            // doesn't match suit of top card when it should
                            else if (game.discardRules.cardMustMatch === "suit" && card.getSuit() !== game.getTopDiscard().getSuit()) {
                                return { 
                                    success: false,
                                    message: "Card does not match suit of top card"
                                }
                            }
                            // doesn't match rank of top card plus one when it should
                            else if (game.discardRules.cardMustMatch === "rankUp" && card.getRank() !== game.getTopDiscard().getRank() + 1) {
                                return { 
                                    success: false,
                                    message: "Card does not match rank of top card + 1"
                                }
                            }
                            // doesn't match rank of top card minus one when it should
                            else if (game.discardRules.cardMustMatch === "rankDown" && card.getRank() !== game.getTopDiscard().getRank() - 1) {
                                return { 
                                    success: false,
                                    message: "Card does not match rank of top card - 1"
                                }
                            }
                            // doesn't match color of top card when it should
                            else if (game.discardRules.cardMustMatch === "color" && ((card.getSuit() === "hearts" || card.getSuit() === "diamonds") && (game.getTopDiscard().getSuit() === "clubs" || game.getTopDiscard().getSuit() === "spades")) ||
                                    ((card.getSuit() === "clubs" || card.getSuit() === "spades") && (game.getTopDiscard().getSuit() === "hearts" || game.getTopDiscard().getSuit() === "diamonds"))) {
                                return {
                                    success: false,
                                    message: "Card does not match color of top card"
                                }
                            }

                            // matches rank of top card when it shouldn't
                            if (game.discardRules.cardMustNotMatch === "rank" && card.getRank() === game.getTopDiscard().getRank()) {
                                return { 
                                    success: false, 
                                    message: "Card cannot match rank of top card" 
                                };
                            }
                            // matches suit of top card when it shouldn't
                            else if (game.discardRules.cardMustNotMatch === "suit" && card.getSuit() === game.getTopDiscard().getSuit()) {
                                return { 
                                    success: false,
                                    message: "Card cannot match suit of top card"
                                }
                            }
                            // matches rank of top card plus one when it shouldn't
                            else if (game.discardRules.cardMustNotMatch === "rankUp" && card.getRank() === game.getTopDiscard().getRank() + 1) {
                                return { 
                                    success: false,
                                    message: "Card cannot match rank of top card + 1"
                                }
                            }
                            // matches rank of top card minus one when it shouldn't
                            else if (game.discardRules.cardMustNotMatch === "rankDown" && card.getRank() === game.getTopDiscard().getRank() - 1) {
                                return { 
                                    success: false,
                                    message: "Card cannot match rank of top card - 1"
                                }
                            }
                            // matches color of top card when it shouldn't
                            else if (game.discardRules.cardMustNotMatch === "color" && ((card.getSuit() === "hearts" || card.getSuit() === "diamonds") && (game.getTopDiscard().getSuit() === "hearts" || game.getTopDiscard().getSuit() === "diamonds")) ||
                                    ((card.getSuit() === "clubs" || card.getSuit() === "spades") && (game.getTopDiscard().getSuit() === "clubs" || game.getTopDiscard().getSuit() === "spades"))) {
                                return {
                                    success: false,
                                    message: "Card cannot match color of top card"
                                }
                            }
                        }
                        else {
                            // all rules have been satisfied, discard the card (note that discarding a card is essentially the same as playing a card, it just goes to the discard pile instead of the play area, so we can use the same function for both)
                            return game.discardCard(playerId, cardId);
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
        
        if (game === undefined || game === null) {
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
