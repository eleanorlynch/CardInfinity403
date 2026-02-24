import type { Ruleset } from "./RulesetTypes";

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
 */
export async function loadRuleset(id: number): Promise<LoadedRuleset> {
  const res = await fetch(`${RULESETS_BASE}/${id}`);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Failed to load ruleset: ${res.status}`);
  }
  return res.json() as Promise<LoadedRuleset>;
}

/**
 * Load the ruleset payload only (for use in game/config). Returns null if not found.
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
 */
export async function listRulesets(
  nameFilter?: string
): Promise<LoadedRuleset[]> {
  const url = nameFilter?.trim()
    ? `${RULESETS_BASE}?name=${encodeURIComponent(nameFilter.trim())}`
    : RULESETS_BASE;
  const res = await fetch(url);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Failed to list rulesets: ${res.status}`);
  }
  return res.json() as Promise<LoadedRuleset[]>;
}
