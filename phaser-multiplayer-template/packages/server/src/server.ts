import { MonitorOptions, monitor } from "@colyseus/monitor";
import { Server, matchMaker } from "colyseus";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import fs from "fs";
import { createServer } from "http";
import { WebSocketTransport } from "@colyseus/ws-transport";
import path from "path";

import { GameRoom } from "./rooms/GameRoom";
import * as rulesetDb from "./rulesetDb";
import * as sessionDb from "./sessionDb";
import type { Ruleset } from "./card-game/RulesetTypes";
import { initRulesetsSchema, initCurrentSessionSchema, isDatabaseConfigured } from "./db";
import { toEditorFields } from "./card-game/RulesetTypes";
import DefaultRulesetData from "./card-game/DefaultRuleset.json";

// Load .env: try multiple locations so it works from any run directory
const envPaths = [
  path.resolve(__dirname, "..", "..", ".env"),           // template/.env (from dist/ or src/)
  path.resolve(__dirname, "..", ".env"),                  // server/.env
  path.resolve(process.cwd(), "..", "..", ".env"),        // template/.env (cwd = server)
  path.resolve(process.cwd(), ".env"),                    // cwd/.env
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (process.env.DATABASE_URL) break;
    if (result.error) console.warn("dotenv at", envPath, "error:", result.error.message);
  }
}
if (!process.env.DATABASE_URL) {
  console.warn(
    "[env] DATABASE_URL not set. Tried (first existing wins):",
    envPaths.map((p) => (fs.existsSync(p) ? p : null)).filter(Boolean)
  );
}

const app: Application = express();
const router = express.Router();
const port: number = Number(process.env.PORT) || 3001;

const server = new Server({
  transport: new WebSocketTransport({
    server: createServer(app),
  }),
});

// Middleware for CORS and WebSocket headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Game Rooms
server.define("game", GameRoom);

router.get("/room-exists/:roomId", async (req: Request, res: Response) => {
  try {
    const room = await matchMaker.getRoomById(req.params.roomId);
    if (room === undefined || room === null) {
      res.json({ exists: false, full: false });
    } else {
      res.json({ exists: true, full: room.locked });
    }
  } catch {
    res.json({ exists: false, full: false });
  }
});

app.use(express.json());
app.use(router);

// Rulesets API: store/retrieve rulesets as JSON (structure matches Ruleset.json template)
// When DATABASE_URL is set, rulesets are stored in Neon PostgreSQL.
router.get("/rulesets", async (req: Request, res: Response) => {
  try {
    const name = req.query.name as string | undefined;
    const list = await rulesetDb.listRulesets(name);
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.get("/rulesets/editorFields/:name", async (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name);

  if (name === undefined || name === null || typeof name !== "string" || !name.trim()) {
    res.status(400).json({ error: "Missing or invalid ruleset name" });
    return;
  }

  const row = await rulesetDb.getRulesetByName(name);
  const defaultRuleset: Ruleset = DefaultRulesetData as Ruleset;

  if (row === undefined) {
    res.json({ data: toEditorFields(defaultRuleset) });
  } else {
    res.json({ data: toEditorFields(row.data) });
  }
});

router.get("/rulesets/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid ruleset id" });
    return;
  }
  try {
    const row = await rulesetDb.getRulesetById(id);
    if (!row) {
      res.status(404).json({ error: "Ruleset not found" });
      return;
    }
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.post("/rulesets", async (req: Request, res: Response) => {
  const data = req.body;
  if (!data || typeof data !== "object") {
    res.status(400).json({ error: "Invalid ruleset body" });
    return;
  }
  try {
    const row = await rulesetDb.insertRuleset(data as Ruleset);
    const savedTo = isDatabaseConfigured() ? "neon" : "local";
    res.status(201).json({ ...row, savedTo });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.put("/rulesets/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid ruleset id" });
    return;
  }
  const data = req.body;
  if (!data || typeof data !== "object") {
    res.status(400).json({ error: "Invalid ruleset body" });
    return;
  }
  try {
    const row = await rulesetDb.updateRuleset(id, data as Ruleset);
    if (!row) {
      res.status(404).json({ error: "Ruleset not found" });
      return;
    }
    const savedTo = isDatabaseConfigured() ? "neon" : "local";
    res.json({ ...row, savedTo });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// Current session API: list/get by user_id and session_number (for resuming games)
router.get("/sessions", async (req: Request, res: Response) => {
  const user_id = req.query.user_id as string | undefined;
  if (!user_id?.trim()) {
    res.status(400).json({ error: "Missing user_id query" });
    return;
  }
  try {
    const list = await sessionDb.listSessionsByUser(user_id.trim());
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.get("/sessions/:user_id/:session_number", async (req: Request, res: Response) => {
  const user_id = req.params.user_id;
  const session_number = Number(req.params.session_number);
  if (Number.isNaN(session_number)) {
    res.status(400).json({ error: "Invalid session_number" });
    return;
  }
  try {
    const row = await sessionDb.getSession(user_id, session_number);
    if (!row) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// Fetch ruleset by name
router.get("/rulesets/by-name/:name", async (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name);

  if (name === undefined || name === null || typeof name !== "string" || !name.trim()) {
    res.status(400).json({ error: "Missing or invalid ruleset name" });
    return;
  }

  const row = await rulesetDb.getRulesetByName(name);

  if (row === undefined) {
    res.status(404).json({ error: "Ruleset not found" });
    return;
  }

  res.json(row);
});

router.put("/rulesets/by-name/:name", async (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name);

  if (name === undefined || name === null || typeof name !== "string" || !name.trim()) {
    res.status(400).json({ error: "Missing or invalid ruleset name" });
    return;
  }

  const data = req.body;

  if (data === undefined || data === null || typeof data !== "object") {
    res.status(400).json({ error: "Invalid ruleset body" });
    return;
  }

  const row = await rulesetDb.updateRulesetByName(name, data as Ruleset);

  if (row === undefined) {
    res.status(404).json({ error: "Ruleset not found" });
    return;
  }

  const savedTo = isDatabaseConfigured() ? "neon" : "local";
  res.json({ ...row, savedTo });
});

if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientBuildPath));
}

// If you don't want people accessing your server stats, comment this line.
router.use("/colyseus", monitor(server as Partial<MonitorOptions>));

// Fetch token from developer portal and return to the embedded app
// Keep both routes so the client works with the template proxy path (/.proxy/api/token)
// and with any older direct /api/token callers.
const tokenHandler = async (req: Request, res: Response) => {
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req.body.code,
    }),
  });

  const { access_token } = (await response.json()) as {
    access_token: string;
  };

  res.send({ access_token });
};

router.post("/token", tokenHandler);
router.post("/api/token", tokenHandler);

// Using a flat route in dev to match the vite server proxy config
app.use(process.env.NODE_ENV === "production" ? "/.proxy/api" : "/", router);

async function start() {
  if (isDatabaseConfigured()) {
    await initRulesetsSchema();
    await initCurrentSessionSchema();
    console.log("Rulesets storage: Neon (DATABASE_URL connected).");
  } else {
    console.warn(
      "Rulesets storage: local only (packages/server/data/rulesets.json). " +
      "DATABASE_URL not set — add it to phaser-multiplayer-template/.env and restart to save to Neon."
    );
  }
  await server.listen(port);
  console.log(`App is listening on port ${port} !`);
}
start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("Shutting down...");
  server.gracefullyShutdown(true).then(() => {
    process.exit(0);
  });
});
