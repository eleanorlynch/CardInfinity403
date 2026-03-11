import { RulesetClass } from "../rules/RulesetClass";
import { Scene } from "phaser";
import type { LoadedRuleset } from "../utils/server/loadRuleset";
import { listRulesets } from "../utils/server/loadRuleset";
import { getAuth } from "../utils/discordSDK";


export class Rules extends Scene {
  constructor() {
    super("Rules");
  }

  rulesets_temp_delete_later: (LoadedRuleset | RulesetClass)[] = [];
  rulesets: Map<string, Phaser.GameObjects.Container> = new Map();
  page_number: number = 0;

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
      this.rulesets_temp_delete_later = [];
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

    addButton.on("pointerdown", (e: Phaser.Input.Pointer) => {
      addButton.setStyle({ backgroundColor: "#ffffff" });
      e.event.stopPropagation();
      this.scene.start("RulesetEditor", { name: "" });
    });

    const rules_container = this.add.container(0, 0);
    rules_container.setDepth(1);
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


    const navigation_right_button = this.add.text(width * 0.55, height * 0.83, '>', {
      fontFamily: 'Arial',
      fontSize: '3.5rem',
      color: '#101814',
      align: 'center',
      fixedWidth: 50,
      backgroundColor: '#ffffff'
    })

    navigation_right_button.setInteractive({ useHandCursor: true });

    navigation_right_button.on('pointerover', () => {
      navigation_right_button.setBackgroundColor('#EBC9B3');
    });

    navigation_right_button.on('pointerout', () => {
      navigation_right_button.setBackgroundColor('#ffffff');
    });

    navigation_right_button.on('pointerdown', () => {
      this.handle_navigation_click(1);
      // TODO: disable buttons when upper/lower limit reached (# rules / 5 (int div) === 0 || pagenum === 0)
      // depends on if this is left or right
      page_number_indicator.setText('' + this.page_number);
      this.handle_visibility();

    })

    const navigation_left_button = this.add.text(width * 0.41, height * 0.83, '<', {
      fontFamily: 'Arial',
      fontSize: '3.5rem',
      color: '#101814',
      align: 'center',
      fixedWidth: 50,
      backgroundColor: '#ffffff'
    })

    navigation_left_button.setInteractive({ useHandCursor: true });


    navigation_left_button.on('pointerover', () => {
      navigation_left_button.setBackgroundColor('#EBC9B3');
    });

    navigation_left_button.on('pointerout', () => {
      navigation_left_button.setBackgroundColor('#ffffff');
    });

    navigation_left_button.on('pointerdown', () => {
      this.handle_navigation_click(-1);
      page_number_indicator.setText('' + this.page_number);
      // TODO: disable buttons when upper/lower limit reached (# rules / 5 (int div) === 0 || pagenum === 0)
      // depends on if this is left or right
      this.handle_visibility();

    })

    const page_number_indicator = this.add.text(width * 0.48, height * 0.84, String(this.page_number), {
      fontFamily: 'Arial',
      fontSize: '2.5rem',
      color: '#101814',
      align: 'center',
      fixedWidth: 50,
    })

    rules_container.add(rules_container_bg).add(navigation_container);
    navigation_container.add(navigation_container_bg)
      .add(navigation_left_button)
      .add(navigation_right_button);

    addButton.setDepth(1000);

    // Populate rules: load from DB then draw (fallback to hardcoded if API fails)
    this.loadRulesetsThenPopulate(width, height, container_width, page_number_indicator);
  }

  async loadRulesetsThenPopulate(
    width: number,
    height: number,
    container_width: number,
    page_number_indicator: Phaser.GameObjects.Text
  ) {
    try {
      const list = await listRulesets(getAuth()?.user?.id ?? null);
      this.rulesets_temp_delete_later = list.length > 0 ? list : [
        new RulesetClass("uno"),
        new RulesetClass("Default (no saved ruleset)")
      ];
    } catch {
      this.rulesets_temp_delete_later = [
        new RulesetClass("uno"),
        new RulesetClass("hiii"),
        new RulesetClass("the joke one"),
        new RulesetClass("e"),
        new RulesetClass("th is me")
      ];
    }
    this.populate_rulesets(width, height, container_width);
    this.handle_visibility();
  }

  handle_navigation_click(increment: number) {
    if (increment > 0 || this.page_number > 0) {
      this.page_number += increment;
    }
  }

  populate_rulesets(width: number, height: number, container_width: number) {
    const startY = height * 0.27;
    const spacing = height * 0.125;
    const rulesets = this.rulesets_temp_delete_later;
    rulesets.forEach((ruleset, index) => {
      this.make_ruleset_entry_card(ruleset, width * 0.185, startY + (index % 5) * spacing, container_width);
    });
  }

  handle_visibility() {
    let num_to_show: number;
    if (this.rulesets.size >= this.page_number * 5) {
      num_to_show = 5;
    } else {
      num_to_show = this.rulesets.size % 5;
    }
    const list = this.rulesets_temp_delete_later;
    list.forEach((r) => {
      const key = "id" in r && typeof (r as LoadedRuleset).id === "number" ? `id-${(r as LoadedRuleset).id}` : (r as RulesetClass).name;
      const container = this.rulesets.get(key);
      if (container) container.setVisible(false);
    });
    let index = this.page_number * 5;
    while (index < (this.page_number) * 5 + num_to_show && index < list.length) {
      const r = list[index];
      const key = r && "id" in r && typeof (r as LoadedRuleset).id === "number" ? `id-${(r as LoadedRuleset).id}` : (r as RulesetClass).name;
      const container = this.rulesets.get(key);
      if (container) container.setVisible(true);
      index += 1;
    }
  }


  make_ruleset_entry_card(ruleset: LoadedRuleset | RulesetClass, x_pos: number, y_pos: number, container_width: number) {
    const name = ruleset.name;
    const id = "id" in ruleset && typeof (ruleset as LoadedRuleset).id === "number" ? (ruleset as LoadedRuleset).id : null;
    const key = id != null ? `id-${id}` : name;
    const container = this.add.container(x_pos, y_pos);

    const ruleset_bg = this.add.graphics();
    ruleset_bg.fillStyle(0xffffff);
    ruleset_bg.lineStyle(2, 0x000000);
    ruleset_bg.fillRoundedRect(x_pos * -0.125, y_pos * -0.05, container_width * 0.9, 55, 5);
    ruleset_bg.strokeRoundedRect(x_pos * -0.125, y_pos * -0.05, container_width * 0.9, 55, 5);
    container.add(ruleset_bg);

    const ruleset_text = this.add.text(0, y_pos * -0.05 + 10, name, {
      fontFamily: "Arial",
      fontSize: "20px",
      fontStyle: "bold",
      color: "#101814"
    });
    container.add(ruleset_text);

    if (id != null) {
      const playBtn = this.add.text(container_width * 0.7, y_pos * -0.05 + 15, "Play", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#101814",
        backgroundColor: "#EBC9B3",
        padding: { x: 8, y: 4 }
      }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
      playBtn.on("pointerdown", (e: Phaser.Input.Pointer) => {
        e.event.stopPropagation();
        this.registry.set("rulesetId", id);
        this.scene.start("Game");
      });
      container.add(playBtn);
      const editBtn = this.add.text(container_width * 0.55, y_pos * -0.05 + 15, "Edit", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#101814",
        backgroundColor: "#EBC9B3",
        padding: { x: 8, y: 4 }
      }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
      editBtn.on("pointerdown", (e: Phaser.Input.Pointer) => {
        e.event.stopPropagation();
        this.scene.start("RulesetEditor", { name, id });
      });
      container.add(editBtn);
    }

    container.setInteractive(new Phaser.Geom.Rectangle(-x_pos * 0.125, y_pos * -0.05, container_width * 0.9, 55), Phaser.Geom.Rectangle.Contains);
    container.setInteractive({ useHandCursor: true });

    container.on("pointerover", () => {
      ruleset_bg.fillStyle(0x8d8d8d);
      ruleset_bg.fillRoundedRect(x_pos * -0.125, y_pos * -0.05, container_width * 0.9, 55, 5);
      ruleset_bg.strokeRoundedRect(x_pos * -0.125, y_pos * -0.05, container_width * 0.9, 55, 5);
    });

    container.on("pointerout", () => {
      ruleset_bg.fillStyle(0xffffff);
      ruleset_bg.fillRoundedRect(x_pos * -0.125, y_pos * -0.05, container_width * 0.9, 55, 5);
      ruleset_bg.strokeRoundedRect(x_pos * -0.125, y_pos * -0.05, container_width * 0.9, 55, 5);
    });

    container.on("pointerdown", () => {
      this.rulesets_temp_delete_later = [];
      this.scene.start("RulesetEditor", { name, id });
    });
    container.setVisible(false);
    container.setDepth(1);
    this.rulesets.set(key, container);
  }
}