import type { GameStateSnapshot } from "./card-game/GameStateSnapshot";
import { getSql, isDatabaseConfigured } from "./db";

export interface CurrentSessionRow {
  user_id: string;
  session_number: number;
  game_state: GameStateSnapshot;
  created_at: string;
  updated_at: string;
}

function rowFromDb(r: {
  user_id: string;
  session_number: number;
  game_state: GameStateSnapshot;
  created_at: Date | string;
  updated_at: Date | string;
}): CurrentSessionRow {
  return {
    user_id: r.user_id,
    session_number: r.session_number,
    game_state: r.game_state as GameStateSnapshot,
    created_at:
      typeof r.created_at === "string"
        ? r.created_at
        : new Date(r.created_at).toISOString(),
    updated_at:
      typeof r.updated_at === "string"
        ? r.updated_at
        : new Date(r.updated_at).toISOString(),
  };
}

/** Save or update a session. Upserts by (user_id, session_number). */
export async function saveSession(
  user_id: string,
  session_number: number,
  game_state: GameStateSnapshot
): Promise<CurrentSessionRow> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not set; cannot persist current_session");
  }
  const sql = getSql();
  const stateJson = JSON.stringify(game_state);
  const result = (await sql`
    INSERT INTO current_session (user_id, session_number, game_state)
    VALUES (${user_id}, ${session_number}, ${stateJson}::jsonb)
    ON CONFLICT (user_id, session_number)
    DO UPDATE SET game_state = EXCLUDED.game_state, updated_at = now()
    RETURNING user_id, session_number, game_state, created_at, updated_at
  `) as {
    user_id: string;
    session_number: number;
    game_state: GameStateSnapshot;
    created_at: Date | string;
    updated_at: Date | string;
  }[];
  const row = result[0];
  if (!row) throw new Error("saveSession failed");
  return rowFromDb(row);
}

/** Get a session by host user_id and session_number. */
export async function getSession(
  user_id: string,
  session_number: number
): Promise<CurrentSessionRow | undefined> {
  if (!isDatabaseConfigured()) return undefined;
  const sql = getSql();
  const result = (await sql`
    SELECT user_id, session_number, game_state, created_at, updated_at
    FROM current_session
    WHERE user_id = ${user_id} AND session_number = ${session_number}
  `) as {
    user_id: string;
    session_number: number;
    game_state: GameStateSnapshot;
    created_at: Date | string;
    updated_at: Date | string;
  }[];
  const row = result[0];
  return row ? rowFromDb(row) : undefined;
}

/** List sessions for a host (user_id). */
export async function listSessionsByUser(
  user_id: string
): Promise<CurrentSessionRow[]> {
  if (!isDatabaseConfigured()) return [];
  const sql = getSql();
  const result = (await sql`
    SELECT user_id, session_number, game_state, created_at, updated_at
    FROM current_session
    WHERE user_id = ${user_id}
    ORDER BY session_number
  `) as {
    user_id: string;
    session_number: number;
    game_state: GameStateSnapshot;
    created_at: Date | string;
    updated_at: Date | string;
  }[];
  return result.map(rowFromDb);
}

/** Delete a session (e.g. when game ends). */
export async function deleteSession(
  user_id: string,
  session_number: number
): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  const sql = getSql();
  await sql`
    DELETE FROM current_session
    WHERE user_id = ${user_id} AND session_number = ${session_number}
  `;
  return true;
}
