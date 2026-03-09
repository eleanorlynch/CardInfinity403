import fs from "fs";
import path from "path";
import type { Ruleset } from "./card-game/RulesetTypes";
import { getSql, isDatabaseConfigured } from "./db";

const DATA_DIR = path.join(__dirname, "data");
const RULESETS_FILE = path.join(DATA_DIR, "rulesets.json");

export interface SavedRulesetRow {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  data: Ruleset;
}

// --- File-based storage (used when DATABASE_URL is not set) ---
let nextId = 1;
let rows: SavedRulesetRow[] = [];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadFromFile(): void {
  ensureDataDir();
  if (!fs.existsSync(RULESETS_FILE)) {
    rows = [];
    return;
  }
  try {
    const raw = fs.readFileSync(RULESETS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as SavedRulesetRow[];
    rows = Array.isArray(parsed) ? parsed : [];
    nextId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
  } catch {
    rows = [];
  }
}

function saveToFile(): void {
  ensureDataDir();
  fs.writeFileSync(RULESETS_FILE, JSON.stringify(rows, null, 2), "utf-8");
}

loadFromFile();

function rowFromDb(r: {
  id: number;
  name: string;
  description: string;
  created_at: Date | string;
  updated_at: Date | string;
  data: Ruleset;
}): SavedRulesetRow {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    created_at:
      typeof r.created_at === "string"
        ? r.created_at
        : new Date(r.created_at).toISOString(),
    updated_at:
      typeof r.updated_at === "string"
        ? r.updated_at
        : new Date(r.updated_at).toISOString(),
    data: r.data as Ruleset,
  };
}

// --- Public API (async; uses DB when DATABASE_URL is set, else file) ---

export async function listRulesets(
  nameFilter?: string
): Promise<SavedRulesetRow[]> {
  if (isDatabaseConfigured()) {
    const sql = getSql();
    type DbRow = {
      id: number;
      name: string;
      description: string;
      created_at: Date | string;
      updated_at: Date | string;
      data: Ruleset;
    };
    if (!nameFilter?.trim()) {
      const result = (await sql`
        SELECT id, name, description, created_at, updated_at, data
        FROM rulesets
        ORDER BY id
      `) as DbRow[];
      return result.map(rowFromDb);
    }
    const q = `%${nameFilter.trim().toLowerCase()}%`;
    const result = (await sql`
      SELECT id, name, description, created_at, updated_at, data
      FROM rulesets
      WHERE name ILIKE ${q} OR description ILIKE ${q}
      ORDER BY id
    `) as DbRow[];
    return result.map(rowFromDb);
  }
  if (!nameFilter?.trim()) return [...rows];
  const q = nameFilter.trim().toLowerCase();
  return Promise.resolve(
    rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    )
  );
}

export async function getRulesetById(
  id: number
): Promise<SavedRulesetRow | undefined> {
  if (isDatabaseConfigured()) {
    const sql = getSql();
    const result = await sql`
      SELECT id, name, description, created_at, updated_at, data
      FROM rulesets
      WHERE id = ${id}
    `;
    const row = (result as { id: number; name: string; description: string; created_at: Date | string; updated_at: Date | string; data: Ruleset }[])[0];
    return row ? rowFromDb(row) : undefined;
  }
  return Promise.resolve(rows.find((r) => r.id === id));
}

export function getRulesetByNameSync(name: string): SavedRulesetRow | undefined {
  return rows.find((r) => r.name === name);
}

export async function getRulesetByName(name: string): Promise<SavedRulesetRow | undefined> {
  if (isDatabaseConfigured()) {
    const sql = getSql();
    const result = await sql`
      SELECT id, name, description, created_at, updated_at, data
      FROM rulesets
      WHERE name = ${name}
    `;
    const row = (result as { id: number; name: string; description: string; created_at: Date | string; updated_at: Date | string; data: Ruleset }[])[0];
    return row ? rowFromDb(row) : undefined;
  }
  return Promise.resolve(rows.find((r) => r.name === name));
}

export async function insertRuleset(data: Ruleset): Promise<SavedRulesetRow> {
  if (isDatabaseConfigured()) {
    const sql = getSql();
    const result = await sql`
      INSERT INTO rulesets (name, description, data)
      VALUES (${data.name}, ${data.description ?? ""}, ${JSON.stringify(data)}::jsonb)
      RETURNING id, name, description, created_at, updated_at, data
    `;
    const row = (result as { id: number; name: string; description: string; created_at: Date | string; updated_at: Date | string; data: Ruleset }[])[0];
    if (!row) throw new Error("Insert failed");
    return rowFromDb(row);
  }
  const now = new Date().toISOString();
  const row: SavedRulesetRow = {
    id: nextId++,
    name: data.name,
    description: data.description,
    created_at: now,
    updated_at: now,
    data: { ...data },
  };
  rows.push(row);
  saveToFile();
  return Promise.resolve(row);
}

export async function updateRuleset(
  id: number,
  data: Ruleset
): Promise<SavedRulesetRow | undefined> {
  if (isDatabaseConfigured()) {
    const sql = getSql();
    const result = await sql`
      UPDATE rulesets
      SET name = ${data.name}, description = ${data.description ?? ""}, data = ${JSON.stringify(data)}::jsonb, updated_at = now()
      WHERE id = ${id}
      RETURNING id, name, description, created_at, updated_at, data
    `;
    const row = (result as { id: number; name: string; description: string; created_at: Date | string; updated_at: Date | string; data: Ruleset }[])[0];
    return row ? rowFromDb(row) : undefined;
  }
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return Promise.resolve(undefined);
  const now = new Date().toISOString();
  const row: SavedRulesetRow = {
    ...rows[idx]!,
    name: data.name,
    description: data.description,
    updated_at: now,
    data: { ...data },
  };
  rows[idx] = row;
  saveToFile();
  return Promise.resolve(row);
}

export async function updateRulesetByName(
  name: string,
  data: Ruleset
): Promise<SavedRulesetRow | undefined> {
  if (isDatabaseConfigured()) {
    const sql = getSql();
    const result = await sql`
      UPDATE rulesets
      SET name = ${data.name}, description = ${data.description ?? ""}, data = ${JSON.stringify(data)}::jsonb, updated_at = now()
      WHERE name = ${name}
      RETURNING id, name, description, created_at, updated_at, data
    `;
    const row = (result as { id: number; name: string; description: string; created_at: Date | string; updated_at: Date | string; data: Ruleset }[])[0];
    return row ? rowFromDb(row) : undefined;
  }
  const idx = rows.findIndex((r) => r.name === name);
  if (idx === -1) return undefined;
  const now = new Date().toISOString();
  const row: SavedRulesetRow = {
    ...rows[idx]!,
    name: data.name,
    description: data.description,
    updated_at: now,
    data: { ...data },
  };
  rows[idx] = row;
  saveToFile();
  return row;
}
