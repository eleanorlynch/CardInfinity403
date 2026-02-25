import { pool } from "./database";

/**
 * Type for the ruleset payload stored in DB.
 * Matches the client Ruleset from RulesetTypes.ts (stored as JSONB).
 */
export type RulesetData = Record<string, unknown>;

export interface RulesetRow {
  id: number;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  data: RulesetData;
}

/**
 * Save a ruleset. Creates a new row and returns the inserted row (with id, created_at, updated_at).
 */
export async function saveRuleset(ruleset: RulesetData): Promise<RulesetRow> {
  const name = (ruleset.name as string) ?? "Unnamed";
  const description = (ruleset.description as string) ?? "";
  const client = await pool.connect();
  try {
    const result = await client.query<RulesetRow>(
      `INSERT INTO rulesets (name, description, data)
       VALUES ($1, $2, $3::jsonb)
       RETURNING id, name, description, created_at, updated_at, data`,
      [name, description, JSON.stringify(ruleset)]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Update an existing ruleset by id. Returns the updated row or null if not found.
 */
export async function updateRuleset(
  id: number,
  ruleset: RulesetData
): Promise<RulesetRow | null> {
  const name = (ruleset.name as string) ?? "Unnamed";
  const description = (ruleset.description as string) ?? "";
  const client = await pool.connect();
  try {
    const result = await client.query<RulesetRow>(
      `UPDATE rulesets
       SET name = $1, description = $2, data = $3::jsonb, updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, description, created_at, updated_at, data`,
      [name, description, JSON.stringify(ruleset), id]
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}

/**
 * Get a single ruleset by id. Returns null if not found.
 */
export async function getRulesetById(id: number): Promise<RulesetRow | null> {
  const result = await pool.query<RulesetRow>(
    `SELECT id, name, description, created_at, updated_at, data
     FROM rulesets WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

/**
 * List rulesets, optionally by name (partial match). Newest first.
 */
export async function listRulesets(nameFilter?: string): Promise<RulesetRow[]> {
  if (nameFilter && nameFilter.trim()) {
    const result = await pool.query<RulesetRow>(
      `SELECT id, name, description, created_at, updated_at, data
       FROM rulesets WHERE name ILIKE $1 ORDER BY created_at DESC`,
      [`%${nameFilter.trim()}%`]
    );
    return result.rows;
  }
  const result = await pool.query<RulesetRow>(
    `SELECT id, name, description, created_at, updated_at, data
     FROM rulesets ORDER BY created_at DESC`
  );
  return result.rows;
}
