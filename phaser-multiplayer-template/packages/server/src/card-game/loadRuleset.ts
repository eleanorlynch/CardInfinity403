import fs from "fs";
import path from "path";
import type { Ruleset } from "./RulesetTypes";

const RULESET_JSON_PATH = path.join(__dirname, "Ruleset.json");

/**
 * Load the default ruleset from the template Ruleset.json file.
 * Used when creating a game without a specific saved ruleset id.
 */
export function loadDefaultRuleset(): Ruleset {
  const raw = fs.readFileSync(RULESET_JSON_PATH, "utf-8");
  const data = JSON.parse(raw) as unknown;
  return parseRuleset(data);
}

/**
 * Parse and validate unknown JSON into a Ruleset (with sensible defaults for missing fields).
 */
export function parseRuleset(data: unknown): Ruleset {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid ruleset: expected object");
  }
  const o = data as Record<string, unknown>;

  const defaultCardAbilities: Ruleset["cardAbilities"] = {
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

  return {
    name: typeof o.name === "string" ? o.name : "Card Game",
    description: typeof o.description === "string" ? o.description : "",
    maxPlayers: typeof o.maxPlayers === "number" ? o.maxPlayers : 10,
    minPlayers: typeof o.minPlayers === "number" ? o.minPlayers : 1,
    AValue: o.AValue === 14 ? 14 : 1,
    turnOrder: o.turnOrder === "counterclockwise" ? "counterclockwise" : "clockwise",
    minNumRounds: typeof o.minNumRounds === "number" ? o.minNumRounds : 1,
    hasMaxNumRounds: Boolean(o.hasMaxNumRounds),
    maxNumRounds: typeof o.maxNumRounds === "number" ? o.maxNumRounds : 5,
    ranks: Array.isArray(o.ranks) ? (o.ranks as number[]) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    suits: Array.isArray(o.suits) ? (o.suits as string[]) : ["hearts", "diamonds", "clubs", "spades"],
    startRules: (o.startRules && typeof o.startRules === "object" ? o.startRules : {}) as Ruleset["startRules"],
    drawRules: (o.drawRules && typeof o.drawRules === "object" ? o.drawRules : {}) as Ruleset["drawRules"],
    discardRules: (o.discardRules && typeof o.discardRules === "object" ? o.discardRules : {}) as Ruleset["discardRules"],
    playRules: (o.playRules && typeof o.playRules === "object" ? o.playRules : {}) as Ruleset["playRules"],
    handRules: (o.handRules && typeof o.handRules === "object" ? o.handRules : {}) as Ruleset["handRules"],
    winConditions: (o.winConditions && typeof o.winConditions === "object" ? o.winConditions : {}) as Ruleset["winConditions"],
    cardAbilities: (o.cardAbilities && typeof o.cardAbilities === "object" ? { ...defaultCardAbilities, ...o.cardAbilities } : defaultCardAbilities) as Ruleset["cardAbilities"],
    deckContents: (o.deckContents && typeof o.deckContents === "object" ? o.deckContents : { cards: [] }) as Ruleset["deckContents"],
  };
}
