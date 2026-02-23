import { Scene } from "phaser";
import { authorizeDiscordUser } from "../utils/discordSDK";



export class Rules extends Scene {
  constructor() {
    super("Rules");
  }


  preload() {
    this.load.scenePlugin({
      key: 'rexuiplugin',
      url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
      sceneKey: 'rexUI'
    });
  }

  create() {


    const width = Number(this.game.config.width);
    const height = Number(this.game.config.height);

    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "background");




    const backButton = this.add
      .text(width * 0.05, height * 0.1, "← Back", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#E9DFD9",
        backgroundColor: "#101814",
        padding: { x: 12, y: 6 }
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true });

    backButton.on("pointerover", () => {
      backButton.setStyle({ backgroundColor: "#891900" });
    });



    backButton.on("pointerout", () => {
      backButton.setStyle({ backgroundColor: "#101814" });
    });

    backButton.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });
  }
}