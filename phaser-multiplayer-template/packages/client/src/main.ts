import { ScaleFlow } from "./utils/ScaleFlow";
import { initiateDiscordSDK } from "./utils/discordSDK";
import "./wsPatch" // to fix how colyseus' transport code is evaluated
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

import { Boot } from "./scenes/Boot";
import { Game } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { Background } from "./scenes/Background";
import { Rules } from "./scenes/Rules";
import { RulesetEditor } from "./scenes/RulesetEditor";

(async () => {
  // Match the template startup behavior so scene boot is not delayed by SDK readiness.
  initiateDiscordSDK();

  new ScaleFlow({
    type: Phaser.AUTO,
    parent: "gameParent",
    width: 1280, // this must be a pixel value
    height: 720, // this must be a pixel value
    backgroundColor: "#000000",
    roundPixels: false,
    pixelArt: false,
    // dom required for some user interaction
    // please be very careful about changing this
    dom: {
      createContainer: true
    },
    input: {
      mouse: {
        target: "gameParent"
      },
      touch: {
        target: "gameParent"
      },
    },
    plugins: {
      scene: [
        {
          key: 'rexUI',
          plugin: RexUIPlugin,
          mapping: 'rexUI'
        }
      ],
    },
    scene: [Boot, Preloader, MainMenu, Game, Background, Rules, RulesetEditor],
  });
})();
