import type { Ruleset } from "./RulesetTypes";

const RULESETS_BASE = "/.proxy/api/rulesets";

export interface SavedRuleset {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  data: Ruleset;
}

/**
 * Normalize API/list response so that `data` fits Ruleset (for use in game/config and GameStatus).
 * Merges defaults for missing fields so the result is always a valid Ruleset.
 */
export function parseRulesetData(raw: unknown): Ruleset {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid ruleset: expected object");
  }
  const o = raw as Record<string, unknown>;
  const data = (o.data !== undefined && typeof o.data === "object" ? o.data : o) as Record<string, unknown>;

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
    name: typeof data.name === "string" ? data.name : "",
    description: typeof data.description === "string" ? data.description : "",
    maxPlayers: typeof data.maxPlayers === "number" ? data.maxPlayers : 10,
    minPlayers: typeof data.minPlayers === "number" ? data.minPlayers : 1,
    AValue: data.AValue === 14 ? 14 : 1,
    turnOrder: data.turnOrder === "counterclockwise" ? "counterclockwise" : "clockwise",
    minNumRounds: typeof data.minNumRounds === "number" ? data.minNumRounds : 1,
    hasMaxNumRounds: Boolean(data.hasMaxNumRounds),
    maxNumRounds: typeof data.maxNumRounds === "number" ? data.maxNumRounds : 5,
    ranks: Array.isArray(data.ranks) ? (data.ranks as number[]) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    suits: Array.isArray(data.suits) ? (data.suits as string[]) : ["hearts", "diamonds", "clubs", "spades"],
    startRules: (data.startRules && typeof data.startRules === "object" ? data.startRules : {}) as Ruleset["startRules"],
    drawRules: (data.drawRules && typeof data.drawRules === "object" ? data.drawRules : {}) as Ruleset["drawRules"],
    discardRules: (data.discardRules && typeof data.discardRules === "object" ? data.discardRules : {}) as Ruleset["discardRules"],
    playRules: (data.playRules && typeof data.playRules === "object" ? data.playRules : {}) as Ruleset["playRules"],
    handRules: (data.handRules && typeof data.handRules === "object" ? data.handRules : {}) as Ruleset["handRules"],
    winConditions: (data.winConditions && typeof data.winConditions === "object" ? data.winConditions : {}) as Ruleset["winConditions"],
    cardAbilities: (data.cardAbilities && typeof data.cardAbilities === "object" ? { ...defaultCardAbilities, ...data.cardAbilities } : defaultCardAbilities) as Ruleset["cardAbilities"],
    deckContents: (data.deckContents && typeof data.deckContents === "object" ? data.deckContents : { cards: [] }) as Ruleset["deckContents"],
  };
}

/**
 * Save a new ruleset to the server. Payload should match the structure of
 * server card-game/Ruleset.json template. Returns the saved row (includes id, timestamps).
 */
export async function saveRuleset(ruleset: Ruleset): Promise<SavedRuleset> {
  const res = await fetch(RULESETS_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ruleset),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Failed to save ruleset: ${res.status}`);
  }
  const json = (await res.json()) as unknown;
  const obj = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
  return { ...obj, data: parseRulesetData(json) } as SavedRuleset;
}

/**
 * Update an existing ruleset by id. Returns the updated row.
 */
export async function updateRuleset(
  id: number,
  ruleset: Ruleset
): Promise<SavedRuleset> {
  const res = await fetch(`${RULESETS_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ruleset),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Failed to update ruleset: ${res.status}`);
  }
  const json = (await res.json()) as unknown;
  const obj = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
  return { ...obj, data: parseRulesetData(json) } as SavedRuleset;
}
