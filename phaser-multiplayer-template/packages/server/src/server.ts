import { MonitorOptions, monitor } from "@colyseus/monitor";
import { Server } from "colyseus";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import { createServer } from "http";
import { WebSocketTransport } from "@colyseus/ws-transport";
import path from "path";

import { GameRoom } from "./rooms/GameRoom";
import { initRulesetTable } from "./database";
import {
  saveRuleset,
  updateRuleset,
  getRulesetById,
  listRulesets,
} from "./rulesetDb";

dotenv.config({ path: "../../.env" });

const app: Application = express();
const router = express.Router();
const port: number = Number(process.env.PORT) || 3001;

const server = new Server({
  transport: new WebSocketTransport({
    server: createServer(app),
  }),
});

// Game Rooms
server
  .define("game", GameRoom)
  // filterBy allows us to call joinOrCreate and then hold one game per channel
  // https://discuss.colyseus.io/topic/345/is-it-possible-to-run-joinorcreatebyid/3
  .filterBy(["channelId"]);

app.use(express.json());
app.use(router);

// Ensure ruleset table exists (non-blocking)
initRulesetTable().catch((err) =>
  console.warn("Ruleset table init failed:", err)
);

// ----- Ruleset API (PostgreSQL) -----
router.post("/api/rulesets", async (req: Request, res: Response) => {
  try {
    const ruleset = req.body as Record<string, unknown>;
    if (!ruleset || typeof ruleset !== "object") {
      res.status(400).json({ error: "Request body must be a ruleset object" });
      return;
    }
    const row = await saveRuleset(ruleset);
    res.status(201).json(row);
  } catch (err) {
    console.error("POST /api/rulesets", err);
    res.status(500).json({ error: "Failed to save ruleset" });
  }
});

router.put("/api/rulesets/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid ruleset id" });
      return;
    }
    const ruleset = req.body as Record<string, unknown>;
    if (!ruleset || typeof ruleset !== "object") {
      res.status(400).json({ error: "Request body must be a ruleset object" });
      return;
    }
    const row = await updateRuleset(id, ruleset);
    if (!row) {
      res.status(404).json({ error: "Ruleset not found" });
      return;
    }
    res.json(row);
  } catch (err) {
    console.error("PUT /api/rulesets/:id", err);
    res.status(500).json({ error: "Failed to update ruleset" });
  }
});

router.get("/api/rulesets", async (req: Request, res: Response) => {
  try {
    const name = req.query.name as string | undefined;
    const rows = await listRulesets(name);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/rulesets", err);
    res.status(500).json({ error: "Failed to list rulesets" });
  }
});

router.get("/api/rulesets/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid ruleset id" });
      return;
    }
    const row = await getRulesetById(id);
    if (!row) {
      res.status(404).json({ error: "Ruleset not found" });
      return;
    }
    res.json(row);
  } catch (err) {
    console.error("GET /api/rulesets/:id", err);
    res.status(500).json({ error: "Failed to get ruleset" });
  }
});

if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientBuildPath));
}

// If you don't want people accessing your server stats, comment this line.
router.use("/colyseus", monitor(server as Partial<MonitorOptions>));

// Fetch token from developer portal and return to the embedded app
router.post("/api/token", async (req: Request, res: Response) => {
  let b = new URLSearchParams({
    client_id: process.env.VITE_CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "authorization_code",
    code: req.body.code,
  });

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
});

// Using a flat route in dev to match the vite server proxy config
app.use(process.env.NODE_ENV === "production" ? "/.proxy/api" : "/", router);

server.listen(port).then(() => {
  console.log(`App is listening on port ${port} !`);
});
