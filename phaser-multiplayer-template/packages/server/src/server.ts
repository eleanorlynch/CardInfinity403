import { MonitorOptions, monitor } from "@colyseus/monitor";
import { Server } from "colyseus";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import { createServer } from "http";
import { WebSocketTransport } from "@colyseus/ws-transport";
import path from "path";

import { GameRoom } from "./rooms/GameRoom";
import * as rulesetDb from "./rulesetDb";
import type { Ruleset } from "./card-game/RulesetTypes";

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

// Rulesets API: store/retrieve rulesets as JSON (structure matches Ruleset.json template)
router.get("/rulesets", (req: Request, res: Response) => {
  const name = req.query.name as string | undefined;
  const list = rulesetDb.listRulesets(name);

  res.json(list);
});

router.get("/rulesets/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid ruleset id" });
    return;
  }

  const row = rulesetDb.getRulesetById(id);

  if (row === undefined) {
    res.status(404).json({ error: "Ruleset not found" });
    return;
  }

  res.json(row);
});

router.post("/rulesets", (req: Request, res: Response) => {
  const data = req.body;

  if (data === undefined || data === null || typeof data !== "object") {
    res.status(400).json({ error: "Invalid ruleset body" });
    return;
  }

  try {
    const row = rulesetDb.insertRuleset(data as Ruleset);

    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.put("/rulesets/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid ruleset id" });
    return;
  }

  const data = req.body;

  if (data === undefined || data === null || typeof data !== "object") {
    res.status(400).json({ error: "Invalid ruleset body" });
    return;
  }

  const row = rulesetDb.updateRuleset(id, data as Ruleset);

  if (row === undefined) {
    res.status(404).json({ error: "Ruleset not found" });
    return;
  }

  res.json(row);
});

if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../../client/dist");

  app.use(express.static(clientBuildPath));
}

// If you don't want people accessing your server stats, comment this line.
router.use("/colyseus", monitor(server as Partial<MonitorOptions>));

// Fetch token from developer portal and return to the embedded app.
// Keep both routes so the client works with the template proxy path (/.proxy/api/token)
// and with any older direct /api/token callers.
const tokenHandler = async (req: Request, res: Response) => {
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
};

router.post("/token", tokenHandler);
router.post("/api/token", tokenHandler);

// Using a flat route in dev to match the vite server proxy config
app.use(process.env.NODE_ENV === "production" ? "/.proxy/api" : "/", router);

server.listen(port).then(() => {
  console.log(`App is listening on port ${port} !`);
});
