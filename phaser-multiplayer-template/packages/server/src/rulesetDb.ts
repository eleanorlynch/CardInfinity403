import fs from "fs";
import path from "path";
import type { Ruleset } from "./card-game/RulesetTypes";

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

export function listRulesets(nameFilter?: string): SavedRulesetRow[] {
  if (!nameFilter?.trim()) return [...rows];
  const q = nameFilter.trim().toLowerCase();
  return rows.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
  );
}

export function getRulesetById(id: number): SavedRulesetRow | undefined {
  return rows.find((r) => r.id === id);
}

export function insertRuleset(data: Ruleset): SavedRulesetRow {
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
  return row;
}

export function updateRuleset(
  id: number,
  data: Ruleset
): SavedRulesetRow | undefined {
  const idx = rows.findIndex((r) => r.id === id);
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
