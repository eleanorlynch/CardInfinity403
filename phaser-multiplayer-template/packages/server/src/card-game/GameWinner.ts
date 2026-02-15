import { GameStatus } from "./GameStatus.js";

export class GameWinner {
    // Check if any player has won
    checkWinner(gameState: GameStatus) { // TODO: Make which method it calls variable based on chosen rules
        this.checkMostSuit(gameState);
    }

    emptyHand(gameState: GameStatus) { // Player with empty hand wins
        for (const player of gameState.playerHands) {
            if (gameState.playerHands.length === 0) {
                return {
                    winner: gameState.currentTurn,
                    winCondition: 'empty_hand',
                    message: "Player has no cards left!"
                };
            }
        }
        return null; // No winner yet
    }

    checkMostSuit(gameState: GameStatus) { // Player with most cards of a single suit wins
        const suits = ['clubs','spades','hearts','diamonds']; // later allow for custom suites by making
                                                              // this a GameStatus variable
        if (gameState.totalRounds >= 3) {
            var maxCards: number[] = [];
            var maxCardsIndex: number = 0;
            for (const player of gameState.playerHands) {
                var playerMaxes: number[] = [];
                for (const card of player) {
                    var playerMaxesIndex: number = 0;
                    for (const suit of suits) {
                        if (card.getSuit() === suit) {
                            playerMaxes[playerMaxesIndex] = playerMaxes[playerMaxesIndex] + 1;
                        }
                        playerMaxesIndex++;
                    }
                }
                maxCards[maxCardsIndex] = Math.max(...playerMaxes);
                maxCardsIndex++;
            }
            var currWinner: number = 0;
            var currWinners: number[] = [];
            var isTied: boolean = false;
            var currWinnerSize: number = maxCards[0];
            var playerIndex: number = 0;
            for (const player of maxCards) {
                var currPlayerSize: number = maxCards[playerIndex];
                if (currPlayerSize > currWinnerSize) {
                    currWinner = playerIndex + 1;
                    currWinnerSize = currPlayerSize;
                    isTied = false;
                }
                else if (currPlayerSize === currWinnerSize && playerIndex !== 0) {
                    if (!isTied) {
                        currWinners[0] = currWinner;
                        currWinners[1] = playerIndex;
                    }
                    else {
                        currWinners[currWinners.length] = playerIndex;
                    }
                }
                playerIndex++;
            }
            if (isTied) {
                return {
                    tie: true,
                    winners: currWinners
                }
            }
            else {
                return {
                    tie: false,
                    winner: currWinner
                }
            }
        }
        return null; // No winner yet
    }
}
