import { GameStatus } from "./GameStatus";
import { Card } from "./Card";

export class GameWinner {
    // Check if any player has won
    checkWinner(gameState: GameStatus) {
        // Number of rounds passed is less than minimum rounds, so game cannot end yet
        if (gameState.totalRounds < gameState.minNumRounds) {
            // No winner yet
            return null;
        }
        // Maximum number of rounds exists and has been reached, so a winner must be chosen
        if (gameState.hasMaxNumRounds === true && gameState.totalRounds >= gameState.maxNumRounds) {
            if (gameState.winConditions.mostOfOneSuit.chosen === true) {  
                return this.checkMostOfOneSuit(gameState);
            } else if (gameState.winConditions.mostOfOneRank.chosen === true) {
                return this.checkMostOfOneRank(gameState);
            } else if (gameState.winConditions.mostOfOneColor.chosen === true) {
                return this.checkMostOfOneColor(gameState);
            } else if (gameState.winConditions.leastCardsInHand.chosen === true) {
                return this.checkLeastCardsInHand(gameState);
            } else if (gameState.winConditions.mostCardsInHand.chosen === true) {   
                return this.checkMostCardsInHand(gameState);
            }
        // Maximum number of rounds doesn't exist, so check for win conditions that don't require a maximum number of rounds
        } else if (gameState.winConditions.firstToScore.chosen === true) {
            return this.checkFirstToScore(gameState);
        } else if (gameState.winConditions.firstToHandSize.chosen === true) {
            return this.checkFirstToHandSize(gameState);
        } else if (gameState.winConditions.collectsSetOfCards.chosen === true) {
            return this.checkCollectsSetOfCards(gameState);
        } else if (gameState.winConditions.lastToHaveCardsInHand.chosen === true) {
            return this.checkLastToHaveCardsInHand(gameState);
        }
    }

    // Last player to have cards in hand wins
    checkLastToHaveCardsInHand(gameState: GameStatus) {
        var lastPlayerWithCards: number = -1;
        var allButOneEmpty = true;

        for (const player of gameState.getPlayers()) {

            // Check if a player's hand has cards in it
            if (player.getHand() !== undefined && player.getHand().length > 0) {

                // If a player already has been found to have cards in addition to the current one, there is no winner yet
                if (lastPlayerWithCards !== -1) {
                    return null;
                }

                lastPlayerWithCards = player.getID();
            }
        }
        // Some single player with cards in their hand exists
        if (lastPlayerWithCards !== -1) {
            return {
                winner: lastPlayerWithCards,
                winCondition: 'last_to_have_cards_in_hand',
                message: `Player is the last to have cards in hand!`
            };
        }

        // No winner yet
        return null;
    }

    // TODO: Make sure to test this function
    // Player who collects a certain set of cards wins
    checkCollectsSetOfCards(gameState: GameStatus) {
        for (const player of gameState.getPlayers()) {
            const hand = player.getHand();

            if (hand !== undefined) {
                var hasAllCards: boolean = true;

                const counts = new Map<string, number>();
                const main = gameState.winConditions.collectsSetOfCards.set.map((card: { rank: number; suit: string; }) => `${card.rank}_${card.suit}`);
                const sub = hand.map((card: Card) => `${card.getRank()}_${card.getSuit()}`);

                for (const item of main) {
                    counts.set(item, (counts.get(item) ?? 0) + 1);
                }

                for (const item of sub) {
                    const current = counts.get(item);

                    if (!current) {
                        hasAllCards = false;
                        break;
                    }

                    counts.set(item, current - 1);
                }

                if (hasAllCards) {
                    return {
                        winner: player.getID(),
                        winCondition: 'collects_set_of_cards',
                        message: `Player has collected the set of cards!`
                    };
                }
            }
        }
        // No winner yet
        return null;
    }

    // Player who reaches target score first wins, score is sum of card ranks in hand
    checkFirstToScore(gameState: GameStatus) {
        for (const player of gameState.getPlayers()) {
            var score: number = 0;

            const hand = player.getHand();

            if (hand !== undefined) {

                for (const card of hand) {
                    score += card.getRank();
                }
            }

            if (score >= gameState.winConditions.firstToScore.scoreTarget) {
                return {
                    winner: player.getID(),
                    winCondition: 'score',
                    message: `Player has reached ${gameState.winConditions.firstToScore.scoreTarget} points!`
                };
            }
        }
        // No winner yet
        return null;
    }

    // Player with least cards in their hand wins
    checkLeastCardsInHand(gameState: GameStatus) {
        var currWinner: number = -1;
        var currWinnerSize: number = Number.MAX_VALUE;
        var currWinners: number[] = [];
        var isTied: boolean = false;
        var playerIndex: number = 0;

        for (const player of gameState.getPlayers()) {
            const handSize = player.getHand() !== undefined ? player.getHand().length : 0;

            if (handSize < currWinnerSize) {
                currWinner = player.getID();
                currWinnerSize = handSize;
                isTied = false;
            } else if (handSize === currWinnerSize) {

                if (!isTied) {
                    currWinners = [];
                    currWinners.push(currWinner);
                }

                currWinners.push(player.getID());
                isTied = true;
            }
            playerIndex++;
        }
        if (isTied) {
            return {
                tie: true,
                winners: currWinners,
                winCondition: 'least_cards_in_hand',
                message: "Tie game!"
            };
        }
        return {
            winner: currWinner,
            winCondition: 'least_cards_in_hand',
            message: `Player ${currWinner} has the least cards in hand!`
        };
    }

    // Player with most cards in hand wins
    checkMostCardsInHand(gameState: GameStatus) {
        var currWinner: number = -1;
        var currWinnerSize: number = -1;
        var currWinners: number[] = [];
        var isTied: boolean = false;
        var playerIndex: number = 0;

        for (const player of gameState.getPlayers()) {
            const handSize = player.getHand() !== undefined ? player.getHand().length : 0;

            if (handSize > currWinnerSize) {
                currWinner = player.getID();
                currWinnerSize = handSize;
                isTied = false;
            } else if (handSize === currWinnerSize) {

                if (!isTied) {
                    currWinners = [];
                    currWinners.push(currWinner);
                }

                currWinners.push(player.getID());
                isTied = true;
            }
            playerIndex++;
        }
        if (isTied) {
            return {
                tie: true,
                winners: currWinners,
                winCondition: 'most_cards_in_hand',
                message: "Tie game!"
            };
        }
        return {
            winner: currWinner,
            winCondition: 'most_cards_in_hand',
            message: `Player ${currWinner} has the most cards in hand!`
        };
    }

    // Player with empty hand wins
    checkFirstToHandSize(gameState: GameStatus) {
        for (const player of gameState.getPlayers()) {

            if (player.getHand() !== undefined && player.getHand().length === gameState.winConditions.firstToHandSize.handSizeTarget) {
                return {
                    winner: player.getID(),
                    winCondition: 'hand_size',
                    message: `Player has reached ${gameState.winConditions.firstToHandSize.handSizeTarget} cards!`
                };
            }
        }
        // No winner yet
        return null;
    }

    // Player with most cards of a single suit wins
    checkMostOfOneSuit(gameState: GameStatus) {
        const suits = gameState.suits;

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

                if (gameState.winConditions.mostOfOneSuit.suit === "any") {

                    for (const suit of suits) {

                        if (card.getSuit() === suit) {
                            const max = playerMaxes[playerMaxesIndex];

                            if (max !== undefined) {
                                playerMaxes[playerMaxesIndex] = max + 1;
                            }
                        }
                        playerMaxesIndex++;
                    }
                } else {

                    if (card.getSuit() === gameState.winConditions.mostOfOneSuit.suit) {
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

        // Determine who has the most of one suit of card (or most of a particular suit), and make a list of winners if there is a tie
        for (const player of maxCards) {
            const currPlayerSize = maxCards[playerIndex];

            if (currPlayerSize !== undefined) {

                if (currPlayerSize > currWinnerSize) {
                    currWinner = playerIndex;
                    currWinnerSize = currPlayerSize;
                    isTied = false;
                } else if (currPlayerSize === currWinnerSize) {

                    if (!isTied) {
                        currWinners = [];
                        currWinners[0] = currWinner;
                        currWinners[1] = playerIndex;
                    } else {
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
        } else {
            return {
                tie: false,
                winner: currWinner
            }
        }
    }

    // Player with most cards of a single suit wins
    checkMostOfOneRank(gameState: GameStatus) {
        const ranks = gameState.ranks;

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

                if ((gameState.winConditions.mostOfOneRank.rank as number) === -1) {

                    for (const rank of ranks) {

                        if (card.getRank() === rank) {
                            const max = playerMaxes[playerMaxesIndex];

                            if (max !== undefined) {
                                playerMaxes[playerMaxesIndex] = max + 1;
                            }
                        }
                        playerMaxesIndex++;
                    }
                } else {
                    
                    if (card.getRank() === gameState.winConditions.mostOfOneRank.rank) {
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

        // Determine who has the most of one suit of card (or most of a particular suit), and make a list of winners if there is a tie
        for (const player of maxCards) {
            const currPlayerSize = maxCards[playerIndex];

            if (currPlayerSize !== undefined) {

                if (currPlayerSize > currWinnerSize) {
                    currWinner = playerIndex;
                    currWinnerSize = currPlayerSize;
                    isTied = false;
                } else if (currPlayerSize === currWinnerSize) {

                    if (!isTied) {
                        currWinners = [];
                        currWinners[0] = currWinner;
                        currWinners[1] = playerIndex;
                    } else {
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
        } else {
            return {
                tie: false,
                winner: currWinner
            }
        }
    }

    // Player with most cards of a single suit wins
    checkMostOfOneColor(gameState: GameStatus) {
        const colors = ["red", "black"];

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

                if (gameState.winConditions.mostOfOneColor.color === "any") {

                    for (const color of colors) {

                        if ((color === "red" && (card.getSuit() === "hearts" || card.getSuit() === "diamonds")) ||
                           (color === "black" && (card.getSuit() === "clubs" || card.getSuit() === "spades"))) {
                            const max = playerMaxes[playerMaxesIndex];

                            if (max !== undefined) {
                                playerMaxes[playerMaxesIndex] = max + 1;
                            }
                        }
                        playerMaxesIndex++;
                    }
                } else {
                    if ((gameState.winConditions.mostOfOneColor.color === "red" && (card.getSuit() === "hearts" || card.getSuit() === "diamonds")) ||
                           (gameState.winConditions.mostOfOneColor.color === "black" && (card.getSuit() === "clubs" || card.getSuit() === "spades"))) {
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

        // Determine who has the most of one suit of card (or most of a particular suit), and make a list of winners if there is a tie
        for (const player of maxCards) {
            const currPlayerSize = maxCards[playerIndex];

            if (currPlayerSize !== undefined) {

                if (currPlayerSize > currWinnerSize) {
                    currWinner = playerIndex;
                    currWinnerSize = currPlayerSize;
                    isTied = false;
                } else if (currPlayerSize === currWinnerSize) {

                    if (!isTied) {
                        currWinners = [];
                        currWinners[0] = currWinner;
                        currWinners[1] = playerIndex;
                    } else {
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
        } else {
            return {
                tie: false,
                winner: currWinner
            }
        }
    }
}
