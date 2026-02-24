import { Ruleset } from "../rules/Ruleset"

import { Scene } from "phaser";
import { authorizeDiscordUser } from "../utils/discordSDK";


export class Rules extends Scene {
  constructor() {
    super("Rules");
  }

  rulesets_temp_delete_later: Ruleset[] = [];
  rulesets: Map<string, Phaser.GameObjects.Container> = new Map();

  create() {

    //Static elems
    const width = Number(this.game.config.width);
    const height = Number(this.game.config.height);
    const container_width = width * 0.75;
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "background");
    let scaleX = this.cameras.main.width / bg.width + 0.2;
    let scaleY = this.cameras.main.height / bg.height + 0.2;
    let scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    const title_text = this.add
      .text(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.15, "Rulesets", {
        fontFamily: "Arial Black",
        fontSize: "4.5rem",
        color: "#E9DFD9",
        stroke: "#101814",
        strokeThickness: 10,
        align: "center",
      })
      .setOrigin(0.5);

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

    const addButton = this.add
      .text(width * 0.85, height * 0.1, "+ Add Ruleset", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#E9DFD9",
        backgroundColor: "#101814",
        padding: { x: 12, y: 6 }
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true });

    addButton.on("pointerover", () => {
      addButton.setStyle({ backgroundColor: "#891900" });
    });

    addButton.on("pointerout", () => {
      addButton.setStyle({ backgroundColor: "#101814" });
    });

    addButton.on("pointerdown", () => {
      this.add_ruleset_entry();
    });

    const rules_container = this.add.container();
    const navigation_container = this.add.container();

    const rules_container_bg = this.add
      .graphics({
        fillStyle: { color: 0xE9DFD9 },
        lineStyle: { width: 3, color: 0x101814 }
      })
      .fillRect(width * 0.125, height * 0.2, container_width, height * 0.75)
      .strokeRect(width * 0.125, height * 0.2, container_width, height * 0.75);


    const navigation_container_bg = this.add
      .graphics({
        fillStyle: { color: 0xffffff },
        lineStyle: { width: 3, color: 0x101814 }
      })
      .fillRoundedRect(width * 0.4, height * 0.82, width * 0.2, height * 0.1)
      .strokeRoundedRect(width * 0.4, height * 0.82, width * 0.2, height * 0.1);




    rules_container.add(rules_container_bg).add(navigation_container);
    navigation_container.add(navigation_container_bg);


    //populate rules

    this.rulesets_temp_delete_later.push(new Ruleset("hellooo"));
    this.rulesets_temp_delete_later.push(new Ruleset("hiii"));
    this.rulesets_temp_delete_later.push(new Ruleset("the joke one"));
    this.rulesets_temp_delete_later.push(new Ruleset("e"));
    this.rulesets_temp_delete_later.push(new Ruleset("th is me"));


    this.populate_rulesets(width, height, container_width);
  }


  //Helper fns

  populate_rulesets(width: number, height: number, container_width: number) {
    const startY = height * 0.27;
    const spacing = height * 0.125;
    //consists of loading from DB
    //TODO: jerry 

    //this will hold a list of Ruleset objs loaded from DB
    const rulesets: Ruleset[] = this.rulesets_temp_delete_later;

    //and drawing each elem
    rulesets.forEach((ruleset, index) => {
      this.make_ruleset_entry_card(ruleset, width * 0.185, startY + index * spacing, container_width);
    })
  };

  draw_ruleset_entry_cards() {
    //draws entry cards

  }

  add_ruleset_entry() {
    //adds to DB and map
    //triggers redraw
    // this.make_ruleset_entry_card(new Ruleset("test"), 100, 100);
  }

  make_ruleset_entry_card(ruleset: Ruleset, x_pos: number, y_pos: number, container_width: number) {
    //called by above two fns
    //actually handles making the card and adding
    const container = this.add.container(x_pos, y_pos);

    // Card background
    const ruleset_bg = this.add.graphics();
    ruleset_bg.fillStyle(0xffffff);
    ruleset_bg.lineStyle(2, 0x000000);
    ruleset_bg.fillRoundedRect(x_pos * -0.125, y_pos * -0.05, container_width * 0.9, 55, 5);
    ruleset_bg.strokeRoundedRect(x_pos * -0.125, y_pos * -0.05, container_width * 0.9, 55, 5);
    // ruleset_bg.setInteractive({useHandCursor: true})
    container.add(ruleset_bg);

    const ruleset_text = this.add.text(0, y_pos * -0.05 + 10, ruleset.name, {
      fontFamily: "Arial",
      fontSize: "20px",
      fontStyle: "bold",
      color: "#101814"
    });
    container.add(ruleset_text);

    container.setInteractive(new Phaser.Geom.Rectangle(-x_pos * 0.125, y_pos * -0.05, container_width * 0.9, 55), Phaser.Geom.Rectangle.Contains);
    container.setInteractive({ usehandcursor: true });

    container.on("pointerover", () => {
      ruleset_bg.fillStyle(0x000840);
      ruleset_bg.fillRoundedRect(x_pos * -0.125, y_pos * -0.05, container_width * 0.9, 55, 5);
      ruleset_bg.strokeRoundedRect(x_pos * -0.125, y_pos * -0.05, container_width * 0.9, 55, 5);
    });

    container.on("pointerout", () => {
      ruleset_bg.fillStyle(0xffffff);
      ruleset_bg.fillRoundedRect(x_pos * -0.125, y_pos * -0.05, container_width * 0.9, 55, 5);
      ruleset_bg.strokeRoundedRect(x_pos * -0.125, y_pos * -0.05, container_width * 0.9, 55, 5);
    });


    this.rulesets.set(ruleset.name, container);

  }

}