import { Card } from "./Card";
import { Player } from "./Player";
import { GameWinner } from "./GameWinner";
import { Ruleset } from "./RulesetTypes";

export class GameStatus implements Ruleset {
    gameId: number;
    ruleset: string[];
    players: Player[];
    deck: Card[];
    gameOver: boolean;
    winner: number;
    winners: number[]; // this is a list ofplayer ids (use if tie)
    tied: boolean;
    currentTurn: number; // this is a player id
    discardPile: Card[];
    totalRounds: number;
    drawsThisTurn: number;
    playsThisTurn: number;
    discardsThisTurn: number;
    extraTurn: boolean;
    skipNextPlayer: boolean;
    reverseTurnOrder: boolean;

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
    
    //creates a 52 card deck 
    createDeck(){
        const suits = ['clubs','spades','hearts','diamonds'];
        const ranks = [2,3,4,5,6,7,8,9,10,11,12,13,14];

        this.deck = [];
    
        for(const suit of suits){
            for(const rank of ranks){
                this.deck.push(new Card(suit, rank));
        }
    }
}

    //shuffles the deck before game starts
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
    
    //deals cards to players for the game to begin
    dealCards() {
        // Initialize empty hand for each player
        this.players.forEach(player => {
           player.setHand([]);
        });
        
        // Deal cards (default 7 cards per player)
        const cardsPerPlayer = 3;
        
        for (let i = 0; i < cardsPerPlayer; i++) {
            this.players.forEach(player => {
                if (this.deck.length > 0) {
                    const card = this.deck.pop();
                    const hand = player.getHand();
                    if (hand !== undefined && card !== undefined) { // add error message for else
                        hand.push(card);
                        player.setHand(hand);
                    }
                }
            });
        }

        this.discardPile.push(this.deck.pop()!); // TODO: add error message for if undefined
    }
 
    //Player drawing a card from the deck 
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
                if (topCard !== undefined) { // TODO: make an error message for if false
                    this.deck = [...this.discardPile];
                    this.shuffleDeck();
                    this.discardPile = [topCard]; // Put top card back
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
                // For use later, currently special cards are not implemented
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
        }
        else {
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
        // Check if it's player's turn
        if (this.currentTurn !== playerId) {
            return { 
                success: false, 
                message: "Not your turn" 
            };
        }

        const player = this.players[playerId];
        
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
            if (playerHand !== undefined) { // TODO: add error message for if false
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
        
        const player = this.players[playerId];

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

    nextTurn() {
        this.drawsThisTurn = 0;
        this.playsThisTurn = 0;
        this.discardsThisTurn = 0;
        const Winner = new GameWinner;
        const winnerInfo = Winner.checkWinner(this);
        if (winnerInfo !== null) {
            this.gameOver = true;
        }
        if (!this.extraTurn) {
            if (this.skipNextPlayer) {
                if (!this.reverseTurnOrder) {
                    this.currentTurn = (this.currentTurn + 2) % this.players.length;
                    this.skipNextPlayer = false;
                }
                else { // if turn order is reversed, 
                    this.currentTurn = this.currentTurn - 2;
                    if (this.currentTurn === -1) {
                        this.currentTurn = this.players.length - 1;
                    }
                    else if (this.currentTurn === -2) {
                        this.currentTurn = this.players.length - 2;
                    }
                }
            }
            else {
                if (!this.reverseTurnOrder) {
                    this.currentTurn = (this.currentTurn + 1) % this.players.length;
                }
                else {
                    this.currentTurn = this.currentTurn - 1;
                    if (this.currentTurn < 0) {
                        this.currentTurn = this.players.length - 1;
                    }
                }
            }
            if (this.currentTurn === 0) {
                this.totalRounds++;
            }
        }
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

    getGameState(playerId: number) {
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

        myHand: this.players[playerId]?.getHand() ?? [],
        discardTop: this.getTopDiscard(),
        deckCount: this.getDeckCount(),

        gameOver: this.gameOver,
        winner: this.winner,
    };
    }

}