import { Pool } from "pg";

/**
 * PostgreSQL connection pool for the rules database.
 * Configure via environment variables (optional):
 *   PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
 * Defaults: localhost, 5432, user from env or "postgres", database "rules"
 */
export const pool = new Pool({
  user: process.env.PGUSER ?? "postgres",
  host: process.env.PGHOST ?? "localhost",
  database: process.env.PGDATABASE ?? "rules",
  password: process.env.PGPASSWORD ?? "",
  port: Number(process.env.PGPORT) || 5432,
});

const RULESET_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS rulesets (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data       JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rulesets_name ON rulesets (name);
CREATE INDEX IF NOT EXISTS idx_rulesets_created_at ON rulesets (created_at DESC);
`;

/**
 * Ensure the rulesets table exists. Call once at server startup (e.g. after connecting).
 */
export async function initRulesetTable(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(RULESET_TABLE_SQL);
  } finally {
    client.release();
  }
}
