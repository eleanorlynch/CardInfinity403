import { Card } from "./Card.js";

export class GameStatus {
    // TODO: Once objects have been defined, replace the any datatypes with the object
    gameId: number;
    ruleset: string[];
    players: any[]; // TODO: replace with Player
    deck: Card[]; // TODO: replace with Card
    playerHands: any[][];
    gameOver: boolean;
    winner: any; // TODO: replace with Player
    currentTurn: number; // this is a player id
    discardPile: Card[]; // TODO: replace with Card
    totalRounds: number;
    constructor(gameId: number, ruleset: string[], players: any[]) {
        this.gameId = gameId;
        this.ruleset = ruleset;
        this.players = players;
        this.deck = [];
        this.playerHands = [];
        this.gameOver = false;
        this.winner = null; 
        this.currentTurn = players[0]?.id || null;
        this.discardPile = [];
        this.totalRounds = 0;
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
    //for joker? 
       //if(this.rulset.jokers && this.ruleset.jokerCount > 0){
   // }
}

    //shuffles the deck before game starts
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            if (this.deck[i] !== undefined && this.deck[j] !== undefined) {
                [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
            }
        }
    }
    
    //deals cards to players for the game to begin
    dealCards() {
        // Initialize empty hand for each player
        this.players.forEach(player => {
            this.playerHands[player.id] = [];
        });
        
        // Deal cards (default 7 cards per player)
        const cardsPerPlayer = /*this.ruleset.cardsPerPlayer || */3;
        
        for (let i = 0; i < cardsPerPlayer; i++) {
            this.players.forEach(player => {
                if (this.deck.length > 0) {
                    const card = this.deck.pop();
                    const hand = this.playerHands[player.id];
                    if (hand !== undefined && card !== undefined) { // add error message for else
                        hand.push(card);
                    }
                }
            });
        }
    }
 
    //Player drawing a card from the deck 
    drawCard(playerId: number) {
        // Check if player's turn
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
            if (this.playerHands[playerId] !== undefined) {
                this.playerHands[playerId].push(drawnCard);
                
                return { 
                    success: true, 
                    card: drawnCard,
                    playerHand: this.playerHands[playerId],
                    deckRemaining: this.deck.length
                };
            }
        }
        if (this.playerHands[playerId] !== undefined) {
            return {
                success: false,
                card: undefined,
                playerHand: this.playerHands[playerId],
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
    playCard(playerId: number, cardId: number) {
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
        if (this.playerHands[playerId] !== undefined) {
            const playerHand = this.playerHands[playerId];
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
                this.discardPile.push(playedCard);
                
                // Check if player has no cards left (win condition)
                if (playerHand.length === 0) {
                    this.gameOver = true;
                    this.winner = playerId;
                    
                    return { 
                        success: true, 
                        message: "Card played - You win!",
                        gameOver: true,
                        winner: playerId,
                        discardTop: playedCard
                    };
                }
                
                // Move to next player's turn
                this.nextTurn();
                
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
                    message: "Card played successfully",
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
    discardCard(playerId: number, cardId: number) {
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
        if (this.playerHands[playerId] !== undefined) {
            const playerHand = this.playerHands[playerId];
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
                this.discardPile.push(discardedCard);
                
                // Move to next player's turn
                this.nextTurn();
                
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
        return this.playerHands[playerId] || [];
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

    nextTurn() {
        this.currentTurn = (this.currentTurn + 1) % this.players.length;
        if (this.currentTurn === 0) {
            this.totalRounds++;
        }
    }

    // FOR TESTING PURPOSES
    setRound(round: number) {
        this.totalRounds = round;
    }

    // FOR TESTING PURPOSES
    setPlayerHand(hand: Card[], player: number) {
        this.playerHands[player] = hand;
    }
}

    
