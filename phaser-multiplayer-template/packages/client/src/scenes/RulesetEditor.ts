import { Ruleset } from "../rules/Ruleset"
import DefaultRulesetData from "../utils/DefaultRuleset.json"

import { GameObjects, Scene } from "phaser";
import { Arc } from "phaser3-rex-plugins/plugins/gameobjects/shape/shapes/geoms";
import { Label } from 'phaser3-rex-plugins/templates/ui/ui-components.js';



export class RulesetEditor extends Scene {

  constructor() {
    super("RulesetEditor");
    this.name = "";
  }

  name: string;

  // Track user changes to rules
  private ruleChanges: Map<string, any> = new Map();
  private baseRuleset: any = null;


  init(args: any) {
    this.name = args.name;
  }

  preload() {
    this.load.scenePlugin({
      key: 'rexuiplugin',
      url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
      sceneKey: 'rexUI'
    });
  }

  rulesets_temp_delete_later: Ruleset[] = [];
  rulesets: Map<string, Phaser.GameObjects.Container> = new Map();
  page_number: number = 0;

  async create() {
    // Load the base ruleset to use for defaults
    if (this.name !== undefined && this.name !== null) {
      this.baseRuleset = await this.fetchRulesetData(this.name);
      // Show an alert with the current ruleset loaded from the database.
      try {
        alert("Loaded ruleset from database:\n\n" + JSON.stringify(this.baseRuleset, null, 2));
      } catch (e) {
        alert("Could not display loaded ruleset due to error: " + (e instanceof Error ? e.message : String(e)));
      }
    } else {
      this.baseRuleset = DefaultRulesetData;
    }

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
      .text(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.15, this.name, {
        fontFamily: "Arial Black",
        fontSize: "4.5rem",
        color: "#E9DFD9",
        stroke: "#101814",
        strokeThickness: 10,
        align: "center",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    title_text.on('pointerdown', () => {
      this.rexUI.edit(title_text)
    })

    // const title_input = this.rexUI.add.inputText({
    //   type: "text",
    //   // text: this.name,
    //   x: Number(this.game.config.width) * 0.5,
    //   y: Number(this.game.config.height) * 0.15,
    //   width: 100,
    //   height: 100
    // })

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
      this.scene.start("Rules");
    });

    const saveButton = this.add
      .text(width * 0.95, height * 0.1, "Save ✓", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#E9DFD9",
        backgroundColor: "#101814",
        padding: { x: 12, y: 6 }
      })
      .setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true });

    saveButton.on("pointerover", () => {
      saveButton.setStyle({ backgroundColor: "#228B22" });
    });

    saveButton.on("pointerout", () => {
      saveButton.setStyle({ backgroundColor: "#101814" });
    });

    saveButton.on("pointerdown", () => {
      this.handleSaveRuleset();
    });

    const options_container = this.add.container();
    const navigation_container = this.add.container();

    const options_container_bg = this.add
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

    options_container.add(options_container_bg).add(navigation_container);
    navigation_container.add(navigation_container_bg)
      .add(navigation_left_button)
      .add(navigation_right_button);

    // Create draw rules section
    // TODO: Delete/edit this later, it is a rudimentary example of rules editing to show that it works
    this.createDrawRulesUI(options_container, width, height);

    // --------------------------
    var buttons = this.create_buttons_container("testing", true, ["hi", "hello", "howdy"])

  }

  //Helper fns

  // Handles page navigation. Visibility change should happen here if possible.
  handle_navigation_click(increment: number) {
    if (increment > 0 || this.page_number > 0) {
      this.page_number += increment;
    }
  }

  // Creates a row w/ buttons
  create_buttons_container(title: string, radio: boolean, options: string[], onSelect?: (selectedOption: string) => void) {

    // making a row that has buttons in it
    // should probably have wrapping 

    var buttons_children: Label[] = [];

    // TODO: set up a callback variable?
    // like the callback changes depending on what kind of thing you have

    if (radio) {
      options.forEach((option) => {
        buttons_children.push(this.create_radio_button(option, option));
      })
    } else {
      // options.forEach((option) => {
      //   buttons_children.push(this.create_checkbox_button(option, option));
      // })
    }

    var buttons = this.rexUI.add.buttons({
      x: 100, y: 100,
      orientation: 'x',
      buttons: buttons_children,
      type: ((radio) ? 'radio' : 'checkboxes'),
      setValueCallback: function (button, value) {
        ((button as Label).getElement("icon") as GameObjects.Arc)!.setFillStyle((value) ? 0xffffff : undefined);
        if (value && onSelect) {
          onSelect((button as any).name);
        }
      }
    })
      .layout();

    return buttons;
  }

  // Creates a singular checkbox button
  create_checkbox_button(text: string, name: string) {

  }

  // Creates a single radio button 
  create_radio_button(text: string, name: string) {
    if (name === undefined) {
      name = text;
    }
    var button = this.rexUI.add.label({
      width: 100,
      height: 40,
      text: this.add.text(200, 200, text, {
        fontSize: 18
      }),
      icon: this.add.circle(200, 200, 10).setStrokeStyle(1, 0x000000),
      space: {
        left: 10,
        right: 10,
        icon: 10
      },
      name: name
    });
    return button;
  }


  // Populates the list of categories
  populate_options(width: number, height: number, container_width: number) {
    const startY = height * 0.27;
    const spacing = height * 0.125;

    // TODO: this should handle making each option
  };

  // Creates the draw rules UI with radio buttons for whenToDraw
  // TODO: Delete/edit this later, it is only here to show/test that saving rules edits works
  createDrawRulesUI(container: Phaser.GameObjects.Container, width: number, height: number) {
    const startX = width * 0.15;
    const startY = height * 0.25;
    const labelFontSize = "16px";

    // Label for draw rules section
    const drawRulesLabel = this.add.text(startX, startY, "When to Draw:", {
      fontFamily: "Arial",
      fontSize: labelFontSize,
      color: "#000000",
      align: "left"
    });

    container.add(drawRulesLabel);

    // Options for when to draw
    const drawOptions = [
      "startOfTurn",
      "endOfTurn",
      "afterPlay",
      "afterDiscard",
      "any"
    ];

    // Create radio buttons for draw timing
    const drawButtons = this.create_buttons_container(
      "When to Draw",
      true,
      drawOptions,
      (selectedOption: string) => {
        this.trackChange('drawRules.whenToDraw', selectedOption);
      }
    );

    // Position the buttons
    drawButtons.setPosition(startX, startY + 40);
    container.add(drawButtons);
  };

  // Hides and shows options while navigating
  handle_visibility() {
    let num_to_show: number;
    if (this.rulesets.size >= this.page_number * 5) {
      num_to_show = 5;
    } else {
      num_to_show = this.rulesets.size % 5;
    }

    this.rulesets_temp_delete_later.forEach((ruleset) => {
      this.rulesets.get(ruleset.name)!.setVisible(false);
    })

    let index = this.page_number * 5;
    while (index < (this.page_number) * 5 + num_to_show) {
      console.log(index);
      console.log(this.rulesets.get(this.rulesets_temp_delete_later.at(index)!.name));
      this.rulesets.get(this.rulesets_temp_delete_later.at(index)!.name)!.setVisible(true);
      index += 1;
    }
  }

  // Track a change made by the user to a rule option
  trackChange(key: string, value: any) {
    this.ruleChanges.set(key, value);
    console.log(`Tracked change (in-memory): ${key} = ${JSON.stringify(value)}`);
  }

  // Fetch ruleset data from the server
  private async fetchRulesetData(name: string): Promise<any> {
    try {
      const apiPath = `/.proxy/api/rulesets/by-name/${encodeURIComponent(name)}`;  
      const response = await fetch(apiPath);
      // If the response isn't ok, use the DefaultRulesetData because the ruleset doesn't exist yet
      // TODO: Maybe change how this is implemented, it's pretty clumsy
      if (!response.ok) {
        console.error("Error fetching ruleset:", response.statusText);
        return JSON.parse(JSON.stringify(DefaultRulesetData));
      }
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error fetching ruleset by name:", error);
      alert("Error fetching ruleset: " + (error instanceof Error ? error.message : String(error)));
      return null;
    }
  }

  // Merge user changes with default ruleset values
  private getMergedRuleset(): any {
    // Deep clone the base ruleset (either fetched existing ruleset or default)
    const merged: any = this.baseRuleset;

    // Apply user changes
    Array.from(this.ruleChanges.entries()).forEach(([key, value]) => {
      const keys = key.split('.');
      let current: any = merged;
      
      // Navigate to the nested property
      for (let i = 0; i < keys.length - 1; i++) {
        const keyName = keys[i]!;
        if (!(keyName in current)) {
          current[keyName] = {};
        }
        current = current[keyName];
      }
      
      // Set the final value
      const lastKey = keys[keys.length - 1]!;
      current[lastKey] = value;
    });

    // Update the name from the title
    merged.name = this.name;

    return merged;
  }

  // Handle saving the ruleset
  private async handleSaveRuleset() {
    try {
      const mergedRuleset = this.getMergedRuleset();

      // Check if ruleset exists by name
      let exists = false;

      if (this.name) {
        const checkRes = await fetch(`/.proxy/api/rulesets/by-name/${encodeURIComponent(this.name)}`);
        exists = checkRes.ok;
      }

      let apiPath: string;
      let method: string;

      if (exists) {
        apiPath = `/.proxy/api/rulesets/by-name/${encodeURIComponent(this.name)}`;
        method = "PUT";
      } else {
        apiPath = "/.proxy/api/rulesets";
        method = "POST";
      }

      const response = await fetch(apiPath, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mergedRuleset),
      });

      if (!response.ok) {
        let errorText = await response.text();
        let error;

        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText || "Unknown error" };
        }
        console.error("Error saving ruleset:", error);
        alert("Error saving ruleset: " + (error.error || "Unknown error"));
        return;
      }

      const savedRuleset = await response.json();
      console.log("Ruleset saved successfully:", savedRuleset);
      // TODO: Remove this later, it is only here to confirm that saving works and show the result
      alert("Ruleset saved successfully!\n\n" + JSON.stringify(savedRuleset.data, null, 2));
      
      // Clear in-memory changes after successful save
      this.ruleChanges.clear();
      console.log("Cleared in-memory rule changes after successful save");
    } catch (error) {
      console.error("Error saving ruleset:", error);
      alert("Error saving ruleset: " + (error instanceof Error ? error.message : String(error)));
    }
  }
}