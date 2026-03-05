import { RulesetClass } from "../rules/RulesetClass"
import { Option } from "../rules/Option"
import { GameObjects, Scene } from "phaser";
import { Label } from 'phaser3-rex-plugins/templates/ui/ui-components.js';

export class RulesetEditor extends Scene {

  constructor() {
    super("RulesetEditor");
    this.name = "";
    this.description = "";
    this.working_ruleset = new RulesetClass();
  }

  name: string;
  description: string;
  working_ruleset: RulesetClass;

  init(args: any) {
    // TODO: remove (replace really) below line once we're passing in the actual ruleset
    this.name = args.name;
  }

  // TODO: populate this guy
  // maps each category to a list of options
  options: Map<String, Option<any>[]> = new Map();
  option_objects: Map<Option<any>, Phaser.GameObjects.Container> = new Map();
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

    var title_text = this.add
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

    title_text.on("pointerdown", () => {
      this.rexUI.edit(title_text);
    })


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
      // this.options = [];
      this.scene.start("Rules");
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

    // --------------------------
    // var buttons = this.create_buttons_container("testing", true, ["hi", "hello", "howdy"])
    // 
    this.populate_options();
    this.populate_option_objects(width, height, container_width);
  }


  //Helper fns

  // Handles page navigation. Visibility change should happen here if possible.
  handle_navigation_click(increment: number) {
    if (increment > 0 || this.page_number > 0) {
      this.page_number += increment;
    }
  }

  // Populates display objects for each category and option
  // TODO: this should handle making each option

  populate_option_objects(width: number, height: number, container_width: number) {
    const startY = height * 0.27;
    const spacing = height * 0.125;

    for (const category of this.options.keys()) {
      // TODO: ENSURE THAT THIS EFFECTIVELY STARTS A NEW PAGE BEFORE ADDING A NEW CATEGORY
      this.add_category(category);
      const cat_options = this.options.get(category);
      // now add all options
      if (cat_options !== undefined) {
        for (const option of cat_options) {
          this.add_option(option);
        }
      }
    }
  };

  add_category(name: String) {
    // TODO: implement
  }

  add_option(option: Option<any>) {
    // this will call one of the other creation fns as applicable
    // TODO: implement fully
    switch (option.kind) {
      case "NOMINAL":
        this.create_dropdown();
        break;
      case "NUMERICAL":
        this.create_number_input();
        break;
      case "CHECKBOX":
        this.create_buttons_container("placeholder", false, ["check1", "check2"]);
        break;
      case "RADIO":
        this.create_buttons_container("placeholder", true, ["rad1", "rad2"]);
        break;
      default:
        console.log("what did you do??")
    }
  }

  create_dropdown() {

  }

  create_number_input() {

  }

  // Creates a row w/ buttons
  // create_buttons_container(title: string, radio: boolean, options: string[]) {
  create_buttons_container(title: string, radio: boolean, options: string[]) {

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

  // Hides and shows options while navigating
  handle_visibility() {
    let num_to_show: number;
    if (this.option_objects.size >= this.page_number * 5) {
      num_to_show = 5;
    } else {
      num_to_show = this.option_objects.size % 5;
    }

    //TODO: update this to work with our structure instead of the previous one
    // IE: this is the code copied over from Rules.ts, we want it to work here
    // this.options.forEach((ruleset) => {
    //   this.option_objects.get()!.setVisible(false);
    // })

    let index = this.page_number * 5;
    while (index < (this.page_number) * 5 + num_to_show) {
      // console.log(index);
      // console.log(this.rulesets.get(this.rulesets_temp_delete_later.at(index)!.name));
      // this.rulesets.get(this.rulesets_temp_delete_later.at(index)!.name)!.setVisible(true);
      index += 1;
    }
  }

  save_ruleset() {
    //TODO: implement
    //this is for the save button
    //ruleset should not save or modify DB file until this is done
  }

  populate_options() {
    //TODO: god help you
    //TODO: implement
    // this is going to have to be done MANUALLY, option by option.
    const example_nominal_option = new Option<string>("NOMINAL", "example nominal option");
    const example_numerical_option = new Option<number>("NUMERICAL", 15);
    const example_checkbox_option = new Option<boolean>("CHECKBOX", true);
    const example_radio_option = new Option<boolean>("RADIO", true);

    this.options.set("Max Players", [new Option<number>("NUMERICAL", 4)]);
  }
}