import { ScaleFlow } from "./utils/ScaleFlow";
import { initiateDiscordSDK } from "./utils/discordSDK";
import "./wsPatch" // to fix how colyseus' transport code is evaluated

import { Boot } from "./scenes/Boot";
import { Game } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { Background } from "./scenes/Background";

(async () => {
  // Don't block app startup forever if Discord SDK readiness hangs in embed context.
  try {
    await Promise.race([
      initiateDiscordSDK(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Discord SDK init timed out")), 8000)
      ),
    ]);
  } catch (error) {
    console.error("Discord SDK init failed/timed out:", error);
  }

  new ScaleFlow({
    type: Phaser.AUTO,
    parent: "gameParent",
    width: 1280, // this must be a pixel value
    height: 720, // this must be a pixel value
    backgroundColor: "#000000",
    roundPixels: false,
    pixelArt: false,
    scene: [Boot, Preloader, MainMenu, Game, Background],
  });
})();
