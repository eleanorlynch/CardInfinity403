// RulesetTypes.ts

export interface Ruleset {
    name: string;
    description: string;
    maxPlayers: number;
    minPlayers: number;
    AValue: 1 | 14;
    turnOrder: "clockwise" | "counterclockwise";
    startRules: StartRules;
    drawRules: DrawRules;
    discardRules: DiscardRules;
    playRules: PlayRules;
    handRules: HandRules;
    minNumRounds: number;
    hasMaxNumRounds: boolean;
    maxNumRounds: number;
    winConditions: WinConditions;
    cardAbilities: CardAbilities;
    ranks: number[];
    suits: string[];
    deckContents: DeckContents;
}

export interface StartRules {
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

export interface DrawRules {
    whenToDraw: "startOfTurn" | "endOfTurn" | "afterPlay" | "afterDiscard" | "any";
    minCardsToDraw: number;
    maxCardsToDraw: number;
    drawFrom: "deck" | "discardPile";
}

export interface DiscardRules {
    whenToDiscard: "startOfTurn" | "endOfTurn" | "afterPlay" | "afterDraw" | "any";
    minCardsToDiscard: number;
    maxCardsToDiscard: number;
    cardMustMatch: "suit" | "rank" | "rankUp" | "rankDown" | "color" | "none";
    cardMustNotMatch: "suit" | "rank" | "color" | "none";
}

export interface PlayRules {
    whenToPlay: "startOfTurn" | "endOfTurn" | "afterDraw" | "afterDiscard" | "any";
    cardMustMatch: "suit" | "rank" | "rankUp" | "rankDown" | "color" | "none";
    cardMustNotMatch: "suit" | "rank" | "color" | "none";
    minCardsToPlay: number;
    maxCardsToPlay: number;
}

export interface HandRules {
    startingHandSize: number;
    maxHandSize: number;
    minHandSize: number;
}

export interface WinConditions {
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

export interface CardAbilities {
    specialCards: {
        chosen: boolean;
        cards: Array<{
            rank: number;
            suit: string;
            ability: string;
            activatesOn: "play" | "draw";
        }>;
    };
    skipNextPlayer: AbilityWithCard;
    skipTargetedPlayer: AbilityWithCard & { player?: number };
    reverseTurnOrder: AbilityWithCard;
    drawCardsForNextPlayer: AbilityWithCard & { numDraws?: number };
    drawCardsForTargetedPlayer: AbilityWithCard & { numDraws?: number };
    extraTurn: AbilityWithCard;
    extraDraw: AbilityWithCard & { numExtraDraws?: number };
    extraDiscard: AbilityWithCard & { numExtraDiscards?: number };
    extraPlay: AbilityWithCard & { numExtraPlays?: number };
    wildCard: AbilityWithCard & {
        canChooseSuit: boolean;
        canChooseRank: boolean;
    };
}

export interface AbilityWithCard {
    chosen: boolean;
    activatesOn: "play" | "draw";
    card: Array<{
        rank: number;
        suit: string;
    }>;
}

export interface DeckContents {
    cards: Array<{
        rank: number;
        suit: string;
    }>;
}