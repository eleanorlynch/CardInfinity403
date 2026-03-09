import { neon } from "@neondatabase/serverless";

export type Sql = ReturnType<typeof neon>;

let _sql: Sql | null = null;

function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL?.trim() || undefined;
}

/**
 * Get Neon serverless SQL client. Requires DATABASE_URL to be set.
 */
export function getSql(): Sql {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!_sql) {
    _sql = neon(url);
  }
  return _sql;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

/**
 * Ensure the rulesets table exists. Call once at server startup when using DB.
 */
export async function initRulesetsSchema(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS rulesets (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      data JSONB NOT NULL
    )
  `;
}

/**
 * Ensure the current_session table exists for saving game state so groups can resume later.
 * Keyed by user_id (host) and session_number for lookup.
 */
export async function initCurrentSessionSchema(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS current_session (
      user_id TEXT NOT NULL,
      session_number INTEGER NOT NULL,
      game_state JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, session_number)
    )
  `;
}
