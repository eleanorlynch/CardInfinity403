// RulesetTypes.ts

export interface Ruleset {
    name: string;
    description: string;
    maxPlayers: number;
    minPlayers: number;
    AValue: 1 | 14;
    turnOrder: "clockwise" | "counterclockwise";
   // startRules: StartRules;
   // drawRules: DrawRules;
   // discardRules: DiscardRules;
   // playRules: PlayRules;
   // handRules: HandRules;
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
    cardAbilities: CardAbilities;
    deckContents: {
        cards: Array<{
            rank: number;
            suit: string;
        }>;
    }
}

// IGNORE EVERYTHING BELOW THIS POINT FOR NOW

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
export type RuleInputKind = "nominal" | "numerical" | "radio" | "checkbox";

export type RuleCategory =
    | "General"
    | "Start Rules"
    | "Draw Rules"
    | "Discard Rules"
    | "Play Rules"
    | "Hand Rules"
    | "Win Conditions"
    | "Card Abilities"
    | "Deck";

export interface RuleOption {
    label: string;
    value: string | number | boolean;
}

export interface RuleFieldMeta {
    path: string;
    label: string;
    category: RuleCategory;
    inputKind: RuleInputKind;
    value: string | number | boolean;
    options?: RuleOption[];
}

/**
 * Parse a Ruleset into.
 */
export function toEditorFields(ruleset: Ruleset): RuleFieldMeta[] {
    return [
        { path: "minPlayers", label: "Min Players", category: "General", inputKind: "numerical", value: ruleset.minPlayers },
        { path: "maxPlayers", label: "Max Players", category: "General", inputKind: "numerical", value: ruleset.maxPlayers },
        {
            path: "AValue",
            label: "Ace Value",
            category: "General",
            inputKind: "radio",
            value: ruleset.AValue,
            options: [
                { label: "1", value: 1 },
                { label: "14", value: 14 },
            ],
        },
        {
            path: "turnOrder",
            label: "Turn Order",
            category: "General",
            inputKind: "nominal",
            value: ruleset.turnOrder,
            options: [
                { label: "Clockwise", value: "clockwise" },
                { label: "Counterclockwise", value: "counterclockwise" },
            ],
        },
        {
            path: "drawRules.whenToDraw",
            label: "When To Draw",
            category: "Draw Rules",
            inputKind: "nominal",
            value: ruleset.drawRules.whenToDraw,
            options: [
                { label: "Start Of Turn", value: "startOfTurn" },
                { label: "End Of Turn", value: "endOfTurn" },
                { label: "After Play", value: "afterPlay" },
                { label: "After Discard", value: "afterDiscard" },
                { label: "Any", value: "any" },
            ],
        },
        { path: "drawRules.minCardsToDraw", label: "Min Cards To Draw", category: "Draw Rules", inputKind: "numerical", value: ruleset.drawRules.minCardsToDraw },
        { path: "drawRules.maxCardsToDraw", label: "Max Cards To Draw", category: "Draw Rules", inputKind: "numerical", value: ruleset.drawRules.maxCardsToDraw },
        {
            path: "discardRules.whenToDiscard",
            label: "When To Discard",
            category: "Discard Rules",
            inputKind: "nominal",
            value: ruleset.discardRules.whenToDiscard,
            options: [
                { label: "Start Of Turn", value: "startOfTurn" },
                { label: "End Of Turn", value: "endOfTurn" },
                { label: "After Play", value: "afterPlay" },
                { label: "After Draw", value: "afterDraw" },
                { label: "Any", value: "any" },
            ],
        },
        { path: "discardRules.minCardsToDiscard", label: "Min Cards To Discard", category: "Discard Rules", inputKind: "numerical", value: ruleset.discardRules.minCardsToDiscard },
        { path: "discardRules.maxCardsToDiscard", label: "Max Cards To Discard", category: "Discard Rules", inputKind: "numerical", value: ruleset.discardRules.maxCardsToDiscard },
        {
            path: "discardRules.cardMustMatch",
            label: "Card Must Match",
            category: "Discard Rules",
            inputKind: "nominal",
            value: ruleset.discardRules.cardMustMatch,
            options: [
                { label: "Suit", value: "suit" },
                { label: "Rank", value: "rank" },
                { label: "Rank Up", value: "rankUp" },
                { label: "Rank Down", value: "rankDown" },
                { label: "Color", value: "color" },
                { label: "None", value: "none" },
            ],
        },
        {
            path: "discardRules.cardMustNotMatch",
            label: "Card Must Not Match",
            category: "Discard Rules",
            inputKind: "nominal",
            value: ruleset.discardRules.cardMustNotMatch,
            options: [
                { label: "Suit", value: "suit" },
                { label: "Rank", value: "rank" },
                { label: "Color", value: "color" },
                { label: "None", value: "none" },
            ],
        },
        {
            path: "playRules.whenToPlay",
            label: "When To Play",
            category: "Play Rules",
            inputKind: "nominal",
            value: ruleset.playRules.whenToPlay,
            options: [
                { label: "Start Of Turn", value: "startOfTurn" },
                { label: "End Of Turn", value: "endOfTurn" },
                { label: "After Draw", value: "afterDraw" },
                { label: "After Discard", value: "afterDiscard" },
                { label: "Any", value: "any" },
            ],
        },
        { path: "playRules.minCardsToPlay", label: "Min Cards To Play", category: "Play Rules", inputKind: "numerical", value: ruleset.playRules.minCardsToPlay },
        { path: "playRules.maxCardsToPlay", label: "Max Cards To Play", category: "Play Rules", inputKind: "numerical", value: ruleset.playRules.maxCardsToPlay },
        {
            path: "playRules.cardMustMatch",
            label: "Card Must Match",
            category: "Play Rules",
            inputKind: "nominal",
            value: ruleset.playRules.cardMustMatch,
            options: [
                { label: "Suit", value: "suit" },
                { label: "Rank", value: "rank" },
                { label: "Rank Up", value: "rankUp" },
                { label: "Rank Down", value: "rankDown" },
                { label: "Color", value: "color" },
                { label: "None", value: "none" },
            ],
        },
        {
            path: "playRules.cardMustNotMatch",
            label: "Card Must Not Match",
            category: "Play Rules",
            inputKind: "nominal",
            value: ruleset.playRules.cardMustNotMatch,
            options: [
                { label: "Suit", value: "suit" },
                { label: "Rank", value: "rank" },
                { label: "Color", value: "color" },
                { label: "None", value: "none" },
            ],
        },
        { path: "handRules.startingHandSize", label: "Starting Hand Size", category: "Hand Rules", inputKind: "numerical", value: ruleset.handRules.startingHandSize },
        { path: "handRules.maxHandSize", label: "Maximum Hand Size", category: "Hand Rules", inputKind: "numerical", value: ruleset.handRules.maxHandSize },
        { path: "handRules.minHandSize", label: "Minimum Hand Size", category: "Hand Rules", inputKind: "numerical", value: ruleset.handRules.minHandSize },
        { path: "minNumRounds", label: "Min Num Rounds", category: "General", inputKind: "numerical", value: ruleset.minNumRounds },
        { path: "hasMaxNumRounds", label: "Has Max Num Rounds", category: "General", inputKind: "checkbox", value: ruleset.hasMaxNumRounds },
        { path: "maxNumRounds", label: "Max Num Rounds", category: "General", inputKind: "numerical", value: ruleset.maxNumRounds },
        // Find a way to make start rules mutually exclusive, and also they don't work (aside from choosing specific rank or suit)
        { path: "startRules.host.chosen", label: "Host Starts", category: "Start Rules", inputKind: "checkbox", value: ruleset.startRules.host.chosen },
        { path: "startRules.highestCard.chosen", label: "Highest Card Starts", category: "Start Rules", inputKind: "checkbox", value: ruleset.startRules.highestCard.chosen },
        { path: "startRules.lowestCard.chosen", label: "Lowest Card Starts", category: "Start Rules", inputKind: "checkbox", value: ruleset.startRules.lowestCard.chosen },
        { path: "startRules.mostOfOneSuit.chosen", label: "Most Of One Suit Starts", category: "Start Rules", inputKind: "checkbox", value: ruleset.startRules.mostOfOneSuit.chosen },
        {
            path: "startRules.mostOfOneSuit.suit",
            label: "Most Of One Suit - Suit",
            category: "Start Rules",
            inputKind: "nominal",
            value: ruleset.startRules.mostOfOneSuit.suit,
            options: [
                { label: "Hearts", value: "hearts" },
                { label: "Diamonds", value: "diamonds" },
                { label: "Clubs", value: "clubs" },
                { label: "Spades", value: "spades" },
            ],
        },
        { path: "startRules.mostOfOneRank.chosen", label: "Most Of One Rank Starts", category: "Start Rules", inputKind: "checkbox", value: ruleset.startRules.mostOfOneRank.chosen },
        { path: "startRules.mostOfOneRank.rank", label: "Most Of One Rank - Rank", category: "Start Rules", inputKind: "numerical", value: ruleset.startRules.mostOfOneRank.rank },
        { path: "winConditions.firstToScore.chosen", label: "First To Score", category: "Win Conditions", inputKind: "checkbox", value: ruleset.winConditions.firstToScore.chosen },
        { path: "winConditions.firstToScore.scoreTarget", label: "Score Target", category: "Win Conditions", inputKind: "numerical", value: ruleset.winConditions.firstToScore.scoreTarget },
        { path: "winConditions.firstToHandSize.chosen", label: "First To Hand Size", category: "Win Conditions", inputKind: "checkbox", value: ruleset.winConditions.firstToHandSize.chosen },
        { path: "winConditions.firstToHandSize.handSizeTarget", label: "Hand Size Target", category: "Win Conditions", inputKind: "numerical", value: ruleset.winConditions.firstToHandSize.handSizeTarget },
        { path: "winConditions.mostOfOneSuit.chosen", label: "Most Of One Suit Wins", category: "Win Conditions", inputKind: "checkbox", value: ruleset.winConditions.mostOfOneSuit.chosen },
        {
            path: "winConditions.mostOfOneSuit.suit",
            label: "Most Of One Suit - Suit",
            category: "Win Conditions",
            inputKind: "nominal",
            value: ruleset.winConditions.mostOfOneSuit.suit,
            options: [
                { label: "Hearts", value: "hearts" },
                { label: "Diamonds", value: "diamonds" },
                { label: "Clubs", value: "clubs" },
                { label: "Spades", value: "spades" },
                { label: "Any", value: "any" },
            ],
        },
        { path: "winConditions.mostOfOneRank.chosen", label: "Most Of One Rank Wins", category: "Win Conditions", inputKind: "checkbox", value: ruleset.winConditions.mostOfOneRank.chosen },
        { path: "winConditions.mostOfOneRank.rank", label: "Most Of One Rank - Rank", category: "Win Conditions", inputKind: "numerical", value: ruleset.winConditions.mostOfOneRank.rank },
        { path: "winConditions.mostOfOneColor.chosen", label: "Most Of One Color Wins", category: "Win Conditions", inputKind: "checkbox", value: ruleset.winConditions.mostOfOneColor.chosen },
        {
            path: "winConditions.mostOfOneColor.color",
            label: "Most Of One Color - Color",
            category: "Win Conditions",
            inputKind: "nominal",
            value: ruleset.winConditions.mostOfOneColor.color,
            options: [
                { label: "Red", value: "red" },
                { label: "Black", value: "black" },
                { label: "Any", value: "any" },
            ],
        },
        { path: "winConditions.collectsSetOfCards.chosen", label: "Collects Set Of Cards", category: "Win Conditions", inputKind: "checkbox", value: ruleset.winConditions.collectsSetOfCards.chosen },
        { path: "winConditions.mostCardsInHand.chosen", label: "Most Cards In Hand Wins", category: "Win Conditions", inputKind: "checkbox", value: ruleset.winConditions.mostCardsInHand.chosen },
        { path: "winConditions.leastCardsInHand.chosen", label: "Least Cards In Hand Wins", category: "Win Conditions", inputKind: "checkbox", value: ruleset.winConditions.leastCardsInHand.chosen },
        { path: "winConditions.lastToHaveCardsInHand.chosen", label: "Last To Have Cards Wins", category: "Win Conditions", inputKind: "checkbox", value: ruleset.winConditions.lastToHaveCardsInHand.chosen },
    ];
}

