import type { Ruleset } from "./RulesetTypes";
import { parseRulesetData } from "./saveRuleset";

const RULESETS_BASE = "/.proxy/api/rulesets";

export interface LoadedRuleset {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  data: Ruleset;
}

/**
 * Load a single ruleset by id. Throws if not found or request fails.
 * Parses response so `data` fits RulesetTypes and can be used in GameStatus/game config.
 */
export async function loadRuleset(id: number): Promise<LoadedRuleset> {
  const res = await fetch(`${RULESETS_BASE}/${id}`);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Failed to load ruleset: ${res.status}`);
  }
  const json = (await res.json()) as unknown;
  const obj = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
  return { ...obj, data: parseRulesetData(json) } as LoadedRuleset;
}

/**
 * Load the ruleset payload only (for use in game/config). Returns null if not found.
 * Result fits RulesetTypes so it can be loaded in GameStatus.
 */
export async function loadRulesetData(id: number): Promise<Ruleset | null> {
  try {
    const row = await loadRuleset(id);
    return row.data;
  } catch {
    return null;
  }
}

/**
 * List all rulesets, optionally filtered by name (partial match).
 * Each item's data is parsed to fit RulesetTypes.
 */
export async function listRulesets(
  nameFilter?: string
): Promise<LoadedRuleset[]> {
  const urlObj = new URL(RULESETS_BASE, window.location.origin);
if (nameFilter?.trim()) {
  urlObj.searchParams.set("name", nameFilter.trim());
}
const res = await fetch(urlObj.toString());
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Failed to list rulesets: ${res.status}`);
  }
  const list = (await res.json()) as unknown[];
  return (list || []).map((json) => {
    const obj = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
    return { ...obj, data: parseRulesetData(json) } as LoadedRuleset;
  });
}
