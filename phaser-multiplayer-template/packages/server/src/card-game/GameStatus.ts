import { Card } from "./Card";
import { Player } from "./Player";
import { GameWinner } from "./GameWinner";
import { Ruleset } from "./RulesetTypes";
import type { GameStateSnapshot } from "./GameStateSnapshot";

export type { GameStateSnapshot } from "./GameStateSnapshot";

export class GameStatus implements Ruleset {
    gameId: number;
    ruleset: string[];
    players: Player[];
    deck: Card[];
    gameOver: boolean;
    // winner is a player id
    winner: number;
    // winners is a list of player ids (use if tie)
    winners: number[];
    tied: boolean;
    // currentTurn is a player id
    currentTurn: number;
    discardPile: Card[];
    totalRounds: number;
    drawsThisTurn: number;
    playsThisTurn: number;
    discardsThisTurn: number;
    extraTurn: boolean;
    skipNextPlayer: boolean;
    reverseTurnOrder: boolean;

    // Ruleset variables
    name: string;
    description: string;
    maxPlayers: number;
    minPlayers: number;
    AValue: 1 | 14;
    turnOrder: "clockwise" | "counterclockwise";
    minNumRounds: number;
    hasMaxNumRounds: boolean;
    maxNumRounds: number;
    ranks: number[];
    suits: string[];
    startRules: {
        host: { chosen: boolean };
        highestCard: { chosen: boolean };
        lowestCard: { chosen: boolean };
        mostOfOneSuit: {
            chosen: boolean;
            suit: "hearts" | "diamonds" | "clubs" | "spades";
        };
        mostOfOneRank: {
            chosen: boolean;
            rank: number;
        };
    }
    drawRules: {
        whenToDraw: "startOfTurn" | "endOfTurn" | "afterPlay" | "afterDiscard" | "any";
        minCardsToDraw: number;
        maxCardsToDraw: number;
        drawFrom: "deck" | "discardPile";
    }
    discardRules: {
        whenToDiscard: "startOfTurn" | "endOfTurn" | "afterPlay" | "afterDraw" | "any";
        minCardsToDiscard: number;
        maxCardsToDiscard: number;
        cardMustMatch: "suit" | "rank" | "rankUp" | "rankDown" | "color" | "none";
        cardMustNotMatch: "suit" | "rank" | "color" | "none";
    }
    playRules: {
        whenToPlay: "startOfTurn" | "endOfTurn" | "afterDraw" | "afterDiscard" | "any";
        cardMustMatch: "suit" | "rank" | "rankUp" | "rankDown" | "color" | "none";
        cardMustNotMatch: "suit" | "rank" | "color" | "none";
        minCardsToPlay: number;
        maxCardsToPlay: number;
    }
    handRules: {
        startingHandSize: number;
        maxHandSize: number;
        minHandSize: number;
    }
    winConditions: {
        firstToScore: {
            chosen: boolean;
            scoreTarget: number;
        };
        firstToHandSize: {
            chosen: boolean;
            handSizeTarget: number;
        };
        mostOfOneSuit: {
            chosen: boolean;
            suit: "hearts" | "diamonds" | "clubs" | "spades" | "any";
        };
        mostOfOneRank: {
            chosen: boolean;
            rank: number;
        };
        mostOfOneColor: {
            chosen: boolean;
            color: "red" | "black" | "any";
        };
        collectsSetOfCards: {
            chosen: boolean;
            set: Array<{rank: number, suit: string}>;
        };
        mostCardsInHand: { chosen: boolean };
        leastCardsInHand: { chosen: boolean };
        lastToHaveCardsInHand: { chosen: boolean };
    }
    deckContents: {
        cards: Array<{
            rank: number;
            suit: string;
        }>;
    }
    cardAbilities: Ruleset["cardAbilities"];

    constructor(
        gameId: number,
        rulesetMeta: string[] | Ruleset,
        players: Player[],
        rulesetData?: Ruleset
    ) {
        this.gameId = gameId;
        this.ruleset = Array.isArray(rulesetMeta) ? rulesetMeta : [rulesetMeta.name];
        this.players = players;
        this.deck = [];
        this.gameOver = false;
        this.winner = -1;
        this.winners = [];
        this.currentTurn = players[0]!.getID();
        this.discardPile = [];
        this.totalRounds = 0;
        this.drawsThisTurn = 0;
        this.playsThisTurn = 0;
        this.discardsThisTurn = 0;
        this.tied = false;
        this.extraTurn = false;
        this.skipNextPlayer = false;
        this.reverseTurnOrder = false;

        const ruleset = rulesetData ?? (typeof rulesetMeta === "object" && !Array.isArray(rulesetMeta) ? rulesetMeta : null);
        if (ruleset) {
            this.name = ruleset.name;
            this.description = ruleset.description;
            this.maxPlayers = ruleset.maxPlayers;
            this.minPlayers = ruleset.minPlayers;
            this.AValue = ruleset.AValue;
            this.turnOrder = ruleset.turnOrder;
            this.minNumRounds = ruleset.minNumRounds;
            this.hasMaxNumRounds = ruleset.hasMaxNumRounds;
            this.maxNumRounds = ruleset.maxNumRounds;
            this.ranks = [...(ruleset.ranks ?? [])];
            this.suits = [...(ruleset.suits ?? [])];
            this.startRules = { ...ruleset.startRules };
            this.drawRules = { ...ruleset.drawRules };
            this.discardRules = { ...ruleset.discardRules };
            this.playRules = { ...ruleset.playRules };
            this.handRules = { ...ruleset.handRules };
            this.winConditions = { ...ruleset.winConditions };
            this.deckContents = { cards: ruleset.deckContents?.cards ? [...ruleset.deckContents.cards] : [] };
            this.cardAbilities = ruleset.cardAbilities ? { ...ruleset.cardAbilities } : ({} as Ruleset["cardAbilities"]);
        } else { 
            // Default rules
            this.name = "";
            this.description = "";
            this.maxPlayers = 10;
            this.minPlayers = 1;
            this.AValue = 1;
            this.turnOrder = "clockwise";
            this.minNumRounds = 1;
            this.hasMaxNumRounds = true;
            this.maxNumRounds = 5;
            this.ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
            this.suits = ["hearts", "diamonds", "clubs", "spades"];
            this.startRules = {
                host: { chosen: true },
                highestCard: { chosen: false },
                lowestCard: { chosen: false },
                mostOfOneSuit: { chosen: false, suit: "hearts" },
                mostOfOneRank: { chosen: false, rank: 1 },
            };
            this.drawRules = {
                whenToDraw: "startOfTurn",
                minCardsToDraw: 1,
                maxCardsToDraw: 3,
                drawFrom: "deck",
            };
            this.discardRules = {
                whenToDiscard: "endOfTurn",
                minCardsToDiscard: 1,
                maxCardsToDiscard: 3,
                cardMustMatch: "none",
                cardMustNotMatch: "none",
            };
            this.playRules = {
                whenToPlay: "startOfTurn",
                cardMustMatch: "none",
                cardMustNotMatch: "none",
                minCardsToPlay: 1,
                maxCardsToPlay: 3,
            };
            this.handRules = {
                startingHandSize: 5,
                maxHandSize: 10,
                minHandSize: 1,
            };
            this.winConditions = {
                firstToScore: { chosen: false, scoreTarget: 0 },
                firstToHandSize: { chosen: false, handSizeTarget: 0 },
                mostOfOneSuit: { chosen: false, suit: "any" },
                mostOfOneRank: { chosen: false, rank: 1 },
                mostOfOneColor: { chosen: false, color: "any" },
                collectsSetOfCards: { chosen: false, set: [] },
                mostCardsInHand: { chosen: false },
                leastCardsInHand: { chosen: false },
                lastToHaveCardsInHand: { chosen: false },
            };
            this.deckContents = { cards: [] };
            this.cardAbilities = {
                specialCards: { chosen: false, cards: [] },
                skipNextPlayer: { chosen: false, activatesOn: "play", card: [] },
                skipTargetedPlayer: { chosen: false, activatesOn: "play", card: [] },
                reverseTurnOrder: { chosen: false, activatesOn: "play", card: [] },
                drawCardsForNextPlayer: { chosen: false, activatesOn: "play", card: [], numDraws: 2 },
                drawCardsForTargetedPlayer: { chosen: false, activatesOn: "play", card: [], numDraws: 2 },
                extraTurn: { chosen: false, activatesOn: "play", card: [] },
                extraDraw: { chosen: false, activatesOn: "play", card: [], numExtraDraws: 1 },
                extraDiscard: { chosen: false, activatesOn: "play", card: [], numExtraDiscards: 1 },
                extraPlay: { chosen: false, activatesOn: "play", card: [], numExtraPlays: 1 },
                wildCard: { chosen: false, activatesOn: "play", card: [], canChooseSuit: true, canChooseRank: true },
            };
        }
    }

    getGameId() {
        return this.gameId;
    }

    getRuleset() {
        return this.ruleset;
    }

    getPlayers() {
        return this.players;
    }

    getDrawsThisTurn() {
        return this.drawsThisTurn;
    }

    getPlaysThisTurn() {
        return this.playsThisTurn
    }

    getDiscardsThisTurn() {
        return this.discardsThisTurn;
    }
    
    // Creates a deck based on the given ruleset
    createDeck() {
        for (const card of this.deckContents.cards) {
            this.deck.push(new Card(card.suit, card.rank));
        }
    }

    // Shuffles the deck before game starts
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const firstCard = this.deck[i];
            const secondCard = this.deck[j];

            if (firstCard !== undefined && secondCard !== undefined) {
                [this.deck[i], this.deck[j]] = [secondCard, firstCard];
            }
        }
    }
    
    // Deals cards to players for the game to begin
    dealCards() {
        // Initialize empty hand for each player
        this.players.forEach(player => {
           player.setHand([]);
        });
        
        // Deal cards based on the starting hand size given in the ruleset
        for (let i = 0; i < this.handRules.startingHandSize; i++) {
            this.players.forEach(player => {
                if (this.deck.length > 0) {
                    const card = this.deck.pop();
                    const hand = player.getHand();

                    // TODO: add error message for else
                    if (hand !== undefined && card !== undefined) {
                        hand.push(card);
                        player.setHand(hand);
                    }
                }
            });
        }

        // TODO: add error message for if undefined
        this.discardPile.push(this.deck.pop()!);
    }
 
    // Player draws a card from the deck 
    drawCard(playerId: number) {
        const player = this.players[playerId];

        // Check if game is over
        if (this.gameOver) {
            return { 
                success: false, 
                message: "Game is over" 
            };
        }
        
        // If deck is empty, reshuffle discard pile
        if (this.deck.length === 0) {

            if (this.discardPile.length > 1) {
                const topCard = this.discardPile.pop();

                // TODO: make an error message for if false
                if (topCard !== undefined) {
                    this.deck = [...this.discardPile];
                    this.shuffleDeck();

                    // Puts the top card back
                    this.discardPile = [topCard];
                }
            } else {
                return { 
                    success: false, 
                    message: "No cards left to draw" 
                };
            }
        }
        
        // Draw the top card from deck
        const drawnCard = this.deck.pop();

        if (drawnCard !== undefined) {

            if (player !== undefined && player.getHand() !== undefined) {
                const hand = player.getHand();

                hand.push(drawnCard);
                player.setHand(hand);
                
                this.drawsThisTurn++;

                var isSpecial: boolean = false;
                var ability: string = "";
                // TODO: For use later, currently special cards are not implemented
               /* for (const specialCard of this.cardAbilities.specialCards.cards) { // checks if the card has a special ability when played
                    if (specialCard.rank === drawnCard.getRank() && specialCard.suit === drawnCard.getSuit() && specialCard.activatesOn === "draw") {
                        isSpecial = true;
                        ability = specialCard.ability;
                        break;
                    }
                } 

                if (isSpecial) { // card has a special ability that activates when played
                    if (ability === "skipNextPlayer") {
                        this.skipNextPlayer = true;
                    }
                    else if (ability === "reverseTurnOrder") {
                        if (this.reverseTurnOrder === true) {
                            this.reverseTurnOrder = false;
                        }
                        else {
                            this.reverseTurnOrder = true;
                        }
                    }
                    else if (ability === "drawCardsForNextPlayer") { // next player in the turn order draws some specified number of cards
                        for (let i = 0; i < this.cardAbilities.drawCardsForNextPlayer.numDraws; i++) {
                            if (this.getPlayers() !== undefined && this.getPlayers()[(playerId + 1) % this.getPlayers().length] !== undefined
                                && this.getPlayers()[(playerId + 1) % this.getPlayers().length].getHand() !== undefined
                                && this.getPlayers()[(playerId + 1) % this.getPlayers().length].getHand().length < this.handRules.maxHandSize) {
                                this.drawCard((playerId + 1) % this.getPlayers().length);
                            }
                        }
                    }
                    else if (ability === "extraTurn") { // players takes an extra turn immediately after this one
                        this.extraTurn = true;
                    }
                    else if (ability === "extraDraw") { // player can draw an extra card this turn
                        this.drawsThisTurn = this.drawsThisTurn - 1;
                    }
                    else if (ability === "extraPlay") { // player can play an extra card this turn
                        this.playsThisTurn = this.playsThisTurn - 1;
                    }
                    else if (ability === "extraDiscard") { // player can discard an extra card this turn
                        this.discardsThisTurn = this.discardsThisTurn - 1;
                    }
                } */

                return { 
                    success: true, 
                    card: drawnCard,
                    playerHand: player.getHand(),
                    deckRemaining: this.deck.length
                };
            }
        }

        if (player !== undefined && player.getHand() !== undefined) {
            return {
                success: false,
                card: undefined,
                playerHand: player.getHand(),
                deckRemaining: this.deck.length
            }
        } else {
            return {
                success: false,
                card: undefined,
                playerHand: [],
                deckRemaining: this.deck.length
            }
        }
    }


    // Player plays a card from hand to discard pile
    playCard(playerId: number, cardId: string) {
        const player = this.players[playerId];

        // Check if it's player's turn
        if (this.currentTurn !== playerId) {
            return { 
                success: false, 
                message: "Not your turn" 
            };
        }
        
        // Check if game is over
        if (this.gameOver) {
            return { 
                success: false, 
                message: "Game is over" 
            };
        }
        
        // Find the card in player's hand
        if (player !== undefined && player.getHand() !== undefined) {
            const playerHand = player.getHand();

            // TODO: add error message for if false
            if (playerHand !== undefined) {
                const cardIndex = playerHand.findIndex(card => card.id === cardId);
                
                if (cardIndex === -1) {
                    return { 
                        success: false, 
                        message: "Card not in your hand" 
                    };
                }
                
                // Remove card from hand
                const playedCard = playerHand.splice(cardIndex, 1)[0];
                
                // Add to discard pile
                if (playedCard !== undefined) {
                    this.discardPile.push(playedCard);
                }
                
                this.playsThisTurn++;

                return { 
                    success: true, 
                    message: "Card played successfully",
                    playerHand: playerHand,
                    discardTop: playedCard,
                    nextPlayer: this.currentTurn
                };
            }
            return {
                success: false, 
                message: "Card not played successfully",
                playerHand: playerHand,
                discardTop: this.discardPile[this.discardPile.length],
                nextPlayer: this.currentTurn
            }
        }
        return {
            success: false,
            message: "Card not played successfully",
            playerHand: [],
            discardTop: this.discardPile[this.discardPile.length],
            nextPlayer: this.currentTurn
        }
    }
        
    // Discard a card from hand to discard pile
    discardCard(playerId: number, cardId: string) {
        const player = this.players[playerId];

        // Check if it's player's turn
        if (this.currentTurn !== playerId) {
            return { 
                success: false, 
                message: "Not your turn" 
            };
        }
        
        // Check if game is over
        if (this.gameOver) {
            return { 
                success: false, 
                message: "Game is over" 
            };
        }

        // Find the card in player's hand
        if (player !== undefined && player.getHand() !== undefined) {
            const playerHand = player.getHand();

            if (playerHand !== undefined) {
                const cardIndex = playerHand.findIndex(card => card.id === cardId);
                
                if (cardIndex === -1) {
                    return { 
                        success: false, 
                        message: "Card not in your hand" 
                    };
                }
                
                // Remove card from hand
                const discardedCard = playerHand.splice(cardIndex, 1)[0];
                
                // Add to discard pile
                if (discardedCard !== undefined) {
                    this.discardPile.push(discardedCard);
                }

               this.discardsThisTurn++;

                return { 
                    success: true, 
                    message: "Card discarded",
                    playerHand: playerHand,
                    discardTop: discardedCard,
                    nextPlayer: this.currentTurn
                };
            }
            else {
                return {
                    success: false,
                    message: "Card not discarded",
                    playerHand: playerHand,
                    discardTop: this.discardPile[this.discardPile.length],
                    nextPlayer: this.currentTurn
                }
            }
        }
        return {
            success: false,
            message: "Card not discarded",
            playerHand: [],
            discardTop: this.discardPile[this.discardPile.length],
            nextPlayer: this.currentTurn
        }
    }

  // Helper: Get a player's hand
    getPlayerHand(playerId: number) {
        if (this.players[playerId] !== undefined) {
            if ((this.players[playerId].getHand() !== undefined)) {
                return this.players[playerId].getHand();
            }
        }
    }

  // Helper: Get top card of discard pile
    getTopDiscard() {
        return this.discardPile.length > 0 
            ? this.discardPile[this.discardPile.length - 1] 
            : null;
    }
    
    // Helper: Get remaining cards in deck
    getDeckCount() {
        return this.deck.length;
    }

    // Helper: Get the current turn
    getCurrentTurn() {
        return this.currentTurn;
    }

    // Move to the next turn
    nextTurn() {
        // Check for a winner
        const Winner = new GameWinner;
        const winnerInfo = Winner.checkWinner(this);

        // Reset number of draws/plays/discards this turn
        this.drawsThisTurn = 0;
        this.playsThisTurn = 0;
        this.discardsThisTurn = 0;

        // See if a winner was found
        if (winnerInfo !== null) {
            this.gameOver = true;
        }

        // Check if there is an extra turn for the current player
        if (!this.extraTurn) {

            // Check if next player is going to be skipped
            if (this.skipNextPlayer) {

                // turn order is regular (not reversed)
                if (!this.reverseTurnOrder) {
                    // Skip the next player
                    this.currentTurn = (this.currentTurn + 2) % this.players.length;
                    this.skipNextPlayer = false;
                } else { // turn order is reversed 
                    // Skip the previous player (since turn order is backwards)
                    this.currentTurn = this.currentTurn - 2;

                    if (this.currentTurn === -1) {
                        this.currentTurn = this.players.length - 1;
                    } else if (this.currentTurn === -2) {
                        this.currentTurn = this.players.length - 2;
                    }
                }
            }
            // Next player isn't skipped
            else {
                // turn order is regular (not reversed)
                if (!this.reverseTurnOrder) {
                    this.currentTurn = (this.currentTurn + 1) % this.players.length;
                } else { // turn order is reversed
                    this.currentTurn = this.currentTurn - 1;
                    if (this.currentTurn < 0) {
                        this.currentTurn = this.players.length - 1;
                    }
                }
            }

            // Go to a new round if we reach the starting player
            // TODO: Make the starting point variable based on ruleset
            if (this.currentTurn === 0) {
                this.totalRounds++;
            }
        }

        // If there is an extra turn for the player, reset the draw/play/discard info but allow the current player to take another turn
        this.extraTurn = false;
    }

    // FOR TESTING PURPOSES
    setRound(round: number) {
        this.totalRounds = round;
        this.currentTurn = 0;
        this.drawsThisTurn = 0;
        this.playsThisTurn = 0;
        this.discardsThisTurn = 0;
    }

    // FOR TESTING PURPOSES
    setPlayerHand(hand: Card[], player: number) {
        if (this.players[player] !== undefined) {
            this.players[player].setHand(hand);
        }
    }

    // FOR TESTING PURPOSES
    setDiscardPile(pile: Card[]) {
        this.discardPile = pile;
    }

    // Gets the current game state information for a player (plain objects for wire serialization)
    getGameState(playerId: number) {
        const cardToPlain = (c: Card) => ({
            suit: c.getSuit(),
            rank: c.getRank(),
            id: c.getId(),
            code: c.code ?? `${c.getRank()}${c.getSuit().charAt(0)}`,
        });
        const top = this.getTopDiscard();
        return {
            gameId: this.gameId,
            ruleset: this.ruleset,
            players: this.players.map((p) => ({
                id: p.getID(),
                name: `Player ${p.getID()}`,
                handCount: p.getHand()?.length ?? 0,
            })),
            currentTurn: this.currentTurn,
            isMyTurn: this.currentTurn === playerId,
            myHand: (this.players[playerId]?.getHand() ?? []).map(cardToPlain),
            discardTop: top ? cardToPlain(top) : null,
            deckCount: this.getDeckCount(),
            gameOver: this.gameOver,
            winner: this.winner,
        };
    }

    /** Serialize to a plain object for DB persistence (current_session.game_state). */
    toSnapshot(): GameStateSnapshot {
        const cardToPlain = (c: Card) => ({ rank: c.getRank(), suit: c.getSuit(), id: c.getId() });
        return {
            gameId: this.gameId,
            ruleset: [...this.ruleset],
            gameOver: this.gameOver,
            winner: this.winner,
            winners: [...this.winners],
            tied: this.tied,
            currentTurn: this.currentTurn,
            totalRounds: this.totalRounds,
            drawsThisTurn: this.drawsThisTurn,
            playsThisTurn: this.playsThisTurn,
            discardsThisTurn: this.discardsThisTurn,
            extraTurn: this.extraTurn,
            skipNextPlayer: this.skipNextPlayer,
            reverseTurnOrder: this.reverseTurnOrder,
            players: this.players.map((p) => ({
                id: p.getID(),
                hand: (p.getHand() ?? []).map(cardToPlain),
            })),
            deck: this.deck.map(cardToPlain),
            discardPile: this.discardPile.map(cardToPlain),
            rulesetData: {
                name: this.name,
                description: this.description,
                maxPlayers: this.maxPlayers,
                minPlayers: this.minPlayers,
                AValue: this.AValue,
                turnOrder: this.turnOrder,
                minNumRounds: this.minNumRounds,
                hasMaxNumRounds: this.hasMaxNumRounds,
                maxNumRounds: this.maxNumRounds,
                ranks: [...this.ranks],
                suits: [...this.suits],
                startRules: { ...this.startRules },
                drawRules: { ...this.drawRules },
                discardRules: { ...this.discardRules },
                playRules: { ...this.playRules },
                handRules: { ...this.handRules },
                winConditions: { ...this.winConditions },
                deckContents: { cards: [...(this.deckContents?.cards ?? [])] },
                cardAbilities: this.cardAbilities ? { ...this.cardAbilities } : ({} as Ruleset["cardAbilities"]),
            },
        };
    }

    /** Reconstruct GameStatus from a snapshot (e.g. after loading from current_session). */
    static fromSnapshot(snapshot: GameStateSnapshot): GameStatus {
        const cardFromPlain = (p: { rank: number; suit: string; id: string }) => new Card(p.suit, p.rank);
        const players = snapshot.players.map(
            (p) => new Player(p.id, p.hand.map(cardFromPlain))
        );
        const rulesetData = snapshot.rulesetData;
        const game = new GameStatus(snapshot.gameId, rulesetData, players, rulesetData);
        game.gameOver = snapshot.gameOver;
        game.winner = snapshot.winner;
        game.winners = [...snapshot.winners];
        game.tied = snapshot.tied;
        game.currentTurn = snapshot.currentTurn;
        game.totalRounds = snapshot.totalRounds;
        game.drawsThisTurn = snapshot.drawsThisTurn;
        game.playsThisTurn = snapshot.playsThisTurn;
        game.discardsThisTurn = snapshot.discardsThisTurn;
        game.extraTurn = snapshot.extraTurn;
        game.skipNextPlayer = snapshot.skipNextPlayer;
        game.reverseTurnOrder = snapshot.reverseTurnOrder;
        game.deck = snapshot.deck.map(cardFromPlain);
        game.discardPile = snapshot.discardPile.map(cardFromPlain);
        return game;
    }

}