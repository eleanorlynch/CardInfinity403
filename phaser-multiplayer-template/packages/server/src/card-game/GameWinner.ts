import { GameStatus } from "./GameStatus";
import { Card } from "./Card";

export class GameWinner {
    // Check if any player has won
    checkWinner(gameState: GameStatus) { // TODO: Make which method it calls variable based on chosen rules
        if (gameState.hasMaxNumRounds === true && gameState.totalRounds >= gameState.maxNumRounds) {
            if (gameState.mostOfOneSuit.chosen === true) {  
                return this.checkMostOfOneSuit(gameState);
            }
            else if (gameState.mostOfOneRank.chosen === true) {
                return this.checkMostOfOneRank(gameState);
            }
            else if (gameState.mostOfOneColor.chosen === true) {
                return this.checkMostOfOneColor(gameState);
            }
            else if (gameState.leastCardsInHand.chosen === true) {
                return this.checkLeastCardsInHand(gameState);
            }
            else if (gameState.mostCardsInHand.chosen === true) {   
                return this.checkMostCardsInHand(gameState);
            }
        }
        else if (gameState.firstToScore.chosen === true) {
            return this.checkFirstToScore(gameState);
        }
        else if (gameState.firstToHandSize.chosen === true) {
            return this.checkFirstToHandSize(gameState);
        }
        else if (gameState.collectsSetOfCards.chosen === true) {
            return this.checkCollectsSetOfCards(gameState);
        }
        else if (gameState.lastToHaveCardsInHand.chosen === true) {
            return this.checkLastToHaveCardsInHand(gameState);
        }
    }

    checkLastToHaveCardsInHand(gameState: GameStatus) { // Last player to have cards in hand wins
        var lastPlayerWithCards: number = -1;
        var allButOneEmpty = true;
        for (const player of gameState.getPlayers()) {
            if (player.getHand() !== undefined && player.getHand().length > 0) {
                if (lastPlayerWithCards !== -1) {
                    allButOneEmpty = false;
                    break;
                }
                lastPlayerWithCards = player.getID();
            }
        }
        if (allButOneEmpty && lastPlayerWithCards !== -1) {
            return {
                winner: lastPlayerWithCards,
                winCondition: 'last_to_have_cards_in_hand',
                message: `Player is the last to have cards in hand!`
            };
        }
        return null; // No winner yet
    }

    // TODO: Make sure to test this function
    checkCollectsSetOfCards(gameState: GameStatus) { // Player who collects a certain set of cards wins
        for (const player of gameState.getPlayers()) {
            const hand = player.getHand();
            if (hand !== undefined) {
                var hasAllCards: boolean = true;
                const counts = new Map<string, number>();
                const main = gameState.collectsSetOfCards.set.map((card: { rank: number; suit: string; }) => `${card.rank}_${card.suit}`);
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
        return null; // No winner yet
    }

    checkFirstToScore(gameState: GameStatus) { // Player who reaches target score first wins
        for (const player of gameState.getPlayers()) {
            var score: number = 0;
            const hand = player.getHand();
            if (hand !== undefined) {
                for (const card of hand) {
                    score += card.getRank();
                }
            }
            if (score >= gameState.firstToScore.scoreTarget) {
                return {
                    winner: player.getID(),
                    winCondition: 'score',
                    message: `Player has reached ${gameState.firstToScore.scoreTarget} points!`
                };
            }
        }
        return null; // No winner yet
    }

    checkLeastCardsInHand(gameState: GameStatus) { // Player with least cards in hand wins
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
            }
            else if (handSize === currWinnerSize) {
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

    checkMostCardsInHand(gameState: GameStatus) { // Player with most cards in hand wins
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
            }
            else if (handSize === currWinnerSize) {
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

    checkFirstToHandSize(gameState: GameStatus) { // Player with empty hand wins
        for (const player of gameState.getPlayers()) {
            if (player.getHand() !== undefined && player.getHand().length === gameState.firstToHandSize.handSizeTarget) {
                return {
                    winner: player.getID(),
                    winCondition: 'hand_size',
                    message: `Player has reached ${gameState.firstToHandSize.handSizeTarget} cards!`
                };
            }
        }
        return null; // No winner yet
    }

    checkMostOfOneSuit(gameState: GameStatus) { // Player with most cards of a single suit wins
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
                if (gameState.mostOfOneSuit.suit === "any") {
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
                else {
                    if (card.getSuit() === gameState.mostOfOneSuit.suit) {
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

    checkMostOfOneRank(gameState: GameStatus) { // Player with most cards of a single suit wins
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
                if (gameState.mostOfOneRank.rank === "any") {
                    for (const rank of ranks) {
                        if (card.getRank() === rank) {
                            const max = playerMaxes[playerMaxesIndex];

                            if (max !== undefined) {
                                playerMaxes[playerMaxesIndex] = max + 1;
                            }
                        }
                        playerMaxesIndex++;
                    }
                }
                else {
                    if (card.getRank() === gameState.mostOfOneRank.rank) {
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

    checkMostOfOneColor(gameState: GameStatus) { // Player with most cards of a single suit wins
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
                if (gameState.mostOfOneColor.color === "any") {
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
                }
                else {
                    if ((gameState.mostOfOneColor.color === "red" && (card.getSuit() === "hearts" || card.getSuit() === "diamonds")) ||
                           (gameState.mostOfOneColor.color === "black" && (card.getSuit() === "clubs" || card.getSuit() === "spades"))) {
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
}
