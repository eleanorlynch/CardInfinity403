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
 * Save a new ruleset to the server. Returns the saved row (includes id, timestamps).
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
  return res.json() as Promise<SavedRuleset>;
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
  return res.json() as Promise<SavedRuleset>;
}
