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
 * userId: Discord user id (from getAuth()?.user?.id); required when using Neon so only that user's ruleset is returned.
 */
export async function loadRuleset(id: number, userId?: string | null): Promise<LoadedRuleset> {
  const params = new URLSearchParams();
  if (userId) params.set("user_id", userId);
  const qs = params.toString();
  const url = `${RULESETS_BASE}/${id}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url);
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
export async function loadRulesetData(id: number, userId?: string | null): Promise<Ruleset | null> {
  try {
    const row = await loadRuleset(id, userId);
    return row.data;
  } catch {
    return null;
  }
}

/**
 * List all rulesets for the given user, optionally filtered by name (partial match).
 * userId: Discord user id (from getAuth()?.user?.id); required when using Neon.
 * Each item's data is parsed to fit RulesetTypes.
 */
export async function listRulesets(
  userId?: string | null,
  nameFilter?: string
): Promise<LoadedRuleset[]> {
  const params = new URLSearchParams();
  if (userId) params.set("user_id", userId);
  if (nameFilter?.trim()) params.set("name", nameFilter.trim());
  const qs = params.toString();
  const url = qs ? `${RULESETS_BASE}?${qs}` : RULESETS_BASE;
  const res = await fetch(url);
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
