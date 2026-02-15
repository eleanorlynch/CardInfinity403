import { Card } from "./Card";
import { Player } from "./Player";

export class GameStatus {
    gameId: number;
    ruleset: string[];
    players: Player[];
    deck: Card[];
    //playerHands: any[][];
    gameOver: boolean;
    winner: number; // this is a player id
    currentTurn: number; // this is a player id
    discardPile: Card[];
    totalRounds: number;
    drawsThisTurn: number;
    playsThisTurn: number;
    discardsThisTurn: number;
    constructor(gameId: number, ruleset: string[], players: Player[]) {
        this.gameId = gameId;
        this.ruleset = ruleset;
        this.players = players;
        this.deck = [];
       // this.playerHands = [];
        this.gameOver = false;
        this.winner = -1; 
        this.currentTurn = players[0]!.getID() /*|| null*/; // previously ! was a ?
        this.discardPile = [];
        this.totalRounds = 0;
        this.drawsThisTurn = 0;
        this.playsThisTurn = 0;
        this.discardsThisTurn = 0;
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
    //for joker? 
       //if(this.rulset.jokers && this.ruleset.jokerCount > 0){
   // }
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
           // this.playerHands[player.id] = [];
           player.setHand([]);
        });
        
        // Deal cards (default 7 cards per player)
        const cardsPerPlayer = /*this.ruleset.cardsPerPlayer || */3;
        
        for (let i = 0; i < cardsPerPlayer; i++) {
            this.players.forEach(player => {
                if (this.deck.length > 0) {
                    const card = this.deck.pop();
                    //const hand = this.playerHands[player.id];
                    const hand = player.getHand();
                    if (hand !== undefined && card !== undefined) { // add error message for else
                        hand.push(card);
                        player.setHand(hand);
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
            if (/*this.playerHands[playerId]*/player !== undefined && player.getHand() !== undefined) {
                //this.playerHands[playerId].push(drawnCard);
                const hand = player.getHand();
                hand.push(drawnCard);
                player.setHand(hand);
                
                this.drawsThisTurn++;

                return { 
                    success: true, 
                    card: drawnCard,
                   // playerHand: this.playerHands[playerId],
                    playerHand: player.getHand(),
                    deckRemaining: this.deck.length
                };
            }
        }
        if (/*this.playerHands[playerId]*/player !== undefined && player.getHand() !== undefined) {
            return {
                success: false,
                card: undefined,
                //playerHand: this.playerHands[playerId],
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
        if (/*this.playerHands[playerId]*/player !== undefined && player.getHand() !== undefined) {
            //const playerHand = this.playerHands[playerId];
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
                
                // Check if player has no cards left (win condition)
               /* if (playerHand.length === 0) {
                    this.gameOver = true;
                    this.winner = playerId;
                    
                    return { 
                        success: true, 
                        message: "Card played - You win!",
                        gameOver: true,
                        winner: playerId,
                        discardTop: playedCard
                    };
                } */
                
                // Move to next player's turn
               // this.nextTurn();
                
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
        if (/*this.playerHands[playerId]*/player !== undefined && player.getHand() !== undefined) {
            //const playerHand = this.playerHands[playerId];
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
                
                // Move to next player's turn
               // this.nextTurn();
                
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
                return /*this.playerHands[playerId] || []*/this.players[playerId].getHand();
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

    nextTurn() {
        this.currentTurn = (this.currentTurn + 1) % this.players.length;
        if (this.currentTurn === 0) {
            this.totalRounds++;
        }
        this.drawsThisTurn = 0;
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
        //this.playerHands[player] = hand;
        if (this.players[player] !== undefined) {
            this.players[player].setHand(hand);
        }
    }
}

    
