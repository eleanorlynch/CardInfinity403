import { Scene } from "phaser";
import { authorizeDiscordUser } from "../utils/discordSDK";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "background");
    let scaleX = this.cameras.main.width / bg.width + 0.2;
    let scaleY = this.cameras.main.height / bg.height + 0.2;
    let scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    this.add.image(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.2, "infinity of spades").setScale(0.4);

    this.add
      .text(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.4, "Card Infinity", {
        fontFamily: "Arial Black",
        fontSize: "4.5rem",
        color: "#E9DFD9",
        stroke: "#101814",
        strokeThickness: 10,
        align: "center",
      })
      .setOrigin(0.5)
      .setShadow(3, 3, "#EBC9B3", 0, true, false);

    this.add.line(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.5,
      0, 0, Number(this.game.config.width) * 0.7, 0, 0xE9DFD9).setLineWidth(10);


    const mask_button_start_game = this.make
      .graphics({})
      .fillRoundedRect(Number(this.game.config.width) * 0.4, Number(this.game.config.height) * 0.55, 250, 75, 20)
      .createGeometryMask();

    const button_start_game = this.add
      .text(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.6, 'Start Game', {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#101814',
        align: 'center',
        fixedWidth: 260,
        backgroundColor: '#EBC9B3'
      })
      .setPadding(32)
      .setOrigin(0.5)
      .setMask(mask_button_start_game);

    const mask_button_join_game = this.make
      .graphics({})
      .fillRoundedRect(Number(this.game.config.width) * 0.4, Number(this.game.config.height) * 0.67, 250, 75, 20)
      .createGeometryMask();

    const button_join_game = this.add
      .text(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.72, 'Join Game', {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#101814',
        align: 'center',
        fixedWidth: 260,
        backgroundColor: '#EBC9B3'

      }).setPadding(32).setOrigin(0.5).setMask(mask_button_join_game);

    const mask_button_manage_rules = this.make
      .graphics({})
      .fillRoundedRect(Number(this.game.config.width) * 0.4, Number(this.game.config.height) * 0.79, 250, 75, 20)
      .createGeometryMask();

    const button_manage_rules = this.add
      .text(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.84, 'Manage Rules', {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#101814',
        align: 'center',
        fixedWidth: 260,
        backgroundColor: '#EBC9B3'
      }).setPadding(32).setOrigin(0.5).setMask(mask_button_manage_rules);

    button_start_game.setInteractive({ useHandCursor: true });

    button_start_game.on('pointerover', () => {
      button_start_game.setBackgroundColor('#8d8d8d');
    });

    button_start_game.on('pointerout', () => {
      button_start_game.setBackgroundColor('#EBC9B3');
    });

    button_start_game.on('pointerdown', async () => {
      await authorizeDiscordUser();
      this.scene.start("Game");
    });


    // this.input.once("pointerdown", async () => {
    //   await authorizeDiscordUser();
    //   this.scene.start("Game");
    // });
  }
}
