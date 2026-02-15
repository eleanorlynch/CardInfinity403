import { GameStatus } from "./GameStatus";

export class GameWinner {
    // Check if any player has won
    checkWinner(gameState: GameStatus) { // TODO: Make which method it calls variable based on chosen rules
        return this.checkMostSuit(gameState);
    }

    emptyHand(gameState: GameStatus) { // Player with empty hand wins
        for (const player of gameState.getPlayers()) {
            if (player.getHand() !== undefined && player.getHand().length === 0) {
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
        if (gameState.totalRounds >= 3) { // check for winner if max number of rounds has been reached
            var maxCards: number[] = [];
            var maxCardsIndex: number = 0;

            var allEmpty = true;
            for (const player of gameState.getPlayers()) {
                if (player.getHand() !== undefined) {
                    if (player.getHand().length !== 0) {
                        allEmpty = false;
                        break;
                    }
                }
            }
            if (allEmpty) {
                return {
                    tie: true,
                    winners: gameState.getPlayers().map(player => player.getID()),
                    message: "All players have no cards left!"
                }
            }
            // For every player, find the suit of cards that they have the most of, and record how many
            for (const player of gameState.getPlayers()) {
                const hand = player.getHand();
                var playerMaxes: number[] = new Array<number>(hand.length).fill(0);

                for (const card of hand) {
                    var playerMaxesIndex: number = 0;

                    for (const suit of suits) {
                        if (card.getSuit() === suit) {
                            const max = playerMaxes[playerMaxesIndex];

                            if (max !== undefined) {
                                playerMaxes[playerMaxesIndex] = max + 1;
                            }
                        }
                        playerMaxesIndex++;
                    }
                }
                maxCards[maxCardsIndex] = Math.max(...playerMaxes);
                maxCardsIndex++;
            }

            var currWinner: number = -1;
            var currWinnerSize: number = -1;
            var currWinners: number[] = [];
            var isTied: boolean = false;
            var playerIndex: number = 0;

            // Determine who has the most of one suit of card, and make a list of winners if there is a tie
            for (const player of maxCards) {
                const currPlayerSize = maxCards[playerIndex];

                if (currPlayerSize !== undefined) {
                    if (currPlayerSize > currWinnerSize) {
                        currWinner = playerIndex;
                        currWinnerSize = currPlayerSize;
                        isTied = false;
                    }
                    else if (currPlayerSize === currWinnerSize) {
                        if (!isTied) {
                            currWinners = [];
                            currWinners[0] = currWinner;
                            currWinners[1] = playerIndex;
                        }
                        else {
                            currWinners[currWinners.length] = playerIndex;
                        }
                        isTied = true;
                    }
                    playerIndex++;
                }
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
