import { RulesetClass } from "../rules/RulesetClass"
import { Option } from "../rules/Option"
import DefaultRulesetData from "../utils/DefaultRuleset.json"

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
  types: any;

  // Track user changes to rules
  private ruleChanges: Map<string, any> = new Map();
  private baseRuleset: any = null;

  private editorFields: any[] = [];
  private fieldPaths: Map<string, string> = new Map();


  init(args: any) {
    // TODO: remove (replace really) below line once we're passing in the actual ruleset
    this.name = args.name;
    this.types = undefined;;
  }

  // TODO: populate this guy
  // maps each category to a list of options
  options: Map<String, Option<any>[]> = new Map();
  option_objects: Map<Option<any>, Phaser.GameObjects.Container> = new Map();
  page_number: number = 0;

  async create() {
    // Load the base ruleset to use for defaults
    if (this.name !== undefined && this.name !== null) {
      this.baseRuleset = await this.fetchRulesetData(this.name);
      // Show an alert with the current ruleset loaded from the database.
      try {
        alert("Loaded ruleset from database:\n\n" + JSON.stringify(this.baseRuleset, null, 2));
      } catch (e) {
        console.log("Ruleset loaded (alert suppressed):", this.baseRuleset);
      }
    } else {
      this.baseRuleset = JSON.parse(JSON.stringify(DefaultRulesetData));
    }

    this.editorFields = await this.getTypes();
    alert("Types are:\n\n" + JSON.stringify(this.editorFields, null, 2));

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

    const saveButton = this.add
      .text(width * 0.95, height * 0.1, "Save →", {
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
   // this.createDrawRulesUI(options_container, width, height);

    // --------------------------
    // var buttons = this.create_buttons_container("testing", true, ["hi", "hello", "howdy"])
    // 
    this.populate_options();
    this.populate_option_objects(width, height, container_width);

        // Add this test in create() after setting up the containers
    // TEST: Create a simple numerical input directly
    const testLabel = this.add.text(200, 300, "5", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#101814",
      backgroundColor: "#ffffff",
      padding: { x: 10, y: 5 }
    }).setInteractive({ useHandCursor: true });
    
    testLabel.on('pointerdown', () => {
      console.log("Test label clicked!");
      
      const canvas = this.game.canvas;
      const canvasRect = canvas.getBoundingClientRect();
      
      const input = document.createElement('input');
      input.type = 'number';
      input.value = testLabel.text;
      input.style.position = 'absolute';
      input.style.left = `${canvasRect.left + 200}px`;
      input.style.top = `${canvasRect.top + 300}px`;
      input.style.fontSize = '16px';
      input.style.width = '80px';
      input.style.zIndex = '1000';
      
      document.body.appendChild(input);
      input.focus();
      input.select();
      
      input.addEventListener('blur', () => {
        const newValue = parseInt(input.value);
        if (!isNaN(newValue)) {
          testLabel.setText(`${newValue}`);
          console.log("New value:", newValue);
        }
        input.remove();
      });
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') input.remove();
      });
    });
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

  /*populate_option_objects(width: number, height: number, container_width: number) {
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
  };*/

    populate_option_objects(width: number, height: number, container_width: number) {
    const startX = width * 0.15;
    const startY = height * 0.27;
    const spacing = height * 0.1;
    const itemsPerPage = 5;
    
    let currentY = startY;
    let optionIndex = 0;
    let currentCategory = "";
    
    for (const [category, cat_options] of this.options.entries()) {
      if (cat_options === undefined || cat_options.length === 0) continue;
      
      // Create a container for each category/option group
      const optionContainer = this.add.container(0, 0);
      
      // Add category label
      const categoryLabel = this.add.text(0, 0, String(category) + ":", {
        fontFamily: "Arial Black",
        fontSize: "16px",
        color: "#101814",
        padding: { x: 4, y: 4 }
      });
      optionContainer.add(categoryLabel);
      
      // Determine the type of input based on the first option
      const firstOption = cat_options[0];
      let inputObject: any;
      
      switch (firstOption?.kind) {
        case "NOMINAL":
          // Dropdown - collect all nominal options as dropdown choices
          const dropdownOptions = cat_options
            .filter(opt => opt.kind === "NOMINAL")
            .map(opt => String(opt.value));
          
          if (dropdownOptions.length > 0) {
            const dropdown = this.create_dropdown(
              dropdownOptions,
              dropdownOptions[0],
              (selectedOption: string) => {
                const path = this.fieldPaths.get(String(category)) || String(category);
                this.trackChange(path, selectedOption);
              }
            );
            dropdown.setPosition(150, 0);
            inputObject = dropdown;
            optionContainer.add(dropdown);
          }
          break;
    
        case "NUMERICAL":
          // Number input
          const numValue = firstOption.value as number;
          const numLabel = this.add.text(150, 0, `${numValue}`, {
            fontFamily: "Arial",
            fontSize: "16px",
            color: "#101814",
            backgroundColor: "#ffffff",
            padding: { x: 10, y: 5 }
          }).setInteractive({ useHandCursor: true });
          
          // Add border effect
          const numBg = this.add.rectangle(150 + numLabel.width / 2, numLabel.height / 2, numLabel.width + 4, numLabel.height + 4)
            .setStrokeStyle(2, 0x101814)
            .setFillStyle(0xffffff);
          optionContainer.add(numBg);
          optionContainer.add(numLabel);
          numLabel.setDepth(1);
          
          // Store category for use in callback
          const categoryPath = this.fieldPaths.get(String(category)) || String(category);
          
          numLabel.on('pointerdown', () => {
            const config = {
              type: 'number',
              text: numLabel.text,
              onTextChanged: (textObject: any, text: string) => {
                textObject.text = text;
              },
              onClose: (textObject: any) => {
                const newValue = parseInt(textObject.text);
                if (!isNaN(newValue)) {
                  this.trackChange(categoryPath, newValue);
                }
              }
            };
            
            this.rexUI.edit(numLabel, config);
          });
          
          numLabel.on('pointerover', () => {
            numBg.setFillStyle(0xEBC9B3);
          });
          
          numLabel.on('pointerout', () => {
            numBg.setFillStyle(0xffffff);
          });
          
          inputObject = numLabel;
          break;
          
        case "CHECKBOX":
          // Checkbox buttons - collect all checkbox options
          const checkboxOptions = cat_options
            .filter(opt => opt.kind === "CHECKBOX")
            .map(opt => String(opt.value));
          
          if (checkboxOptions.length > 0) {
            const checkboxButtons = this.create_buttons_container(
              String(category),
              false,
              checkboxOptions,
              (selectedOption: string) => {
                const path = this.fieldPaths.get(String(category)) || String(category);
                this.trackChange(path, selectedOption);
              }
            );
            checkboxButtons.setPosition(150, 10);
            inputObject = checkboxButtons;
            optionContainer.add(checkboxButtons);
            
            for (let i = 0; i < checkboxOptions.length; i++) {
              const optionName = checkboxOptions[i];
              if (optionName !== undefined) {
                checkboxButtons.getButton(i)?.setName(optionName);
              }
            }

            // Set initial state if value is true
            if (firstOption.value === true) {
              const optionName = checkboxOptions[0];
              if (optionName !== undefined) {
                checkboxButtons.setButtonState(optionName, true);
              }
            }
          }
          break;
          
        case "RADIO":
          // Radio buttons - collect all radio options
          const radioOptions = cat_options
            .filter(opt => opt.kind === "RADIO")
            .map(opt => String(opt.value));
          
          if (radioOptions.length > 0) {
            const radioButtons = this.create_buttons_container(
              String(category),
              true,
              radioOptions,
              (selectedOption: string) => {
                const path = this.fieldPaths.get(String(category)) || String(category);
                this.trackChange(path, selectedOption);
              }
            );
            radioButtons.setPosition(150, 10);
            inputObject = radioButtons;
            optionContainer.add(radioButtons);
            
            // Set button names for state management
            for (let i = 0; i < radioOptions.length; i++) {
              const optionName = radioOptions[i];
              if (optionName !== undefined) {
                radioButtons.getButton(i)?.setName(optionName);
              }
            }
            
            // Set initial selected state based on current value
            const currentValue = this.getValueFromPath(this.fieldPaths.get(String(category)) || "");
            if (currentValue !== undefined) {
              radioButtons.setButtonState(String(currentValue), true);
            }
          }
          break;
          
        default:
          console.log(`Unknown option kind: ${firstOption?.kind} for category: ${category}`);
      }
      
      // Store the option container
      if (inputObject !== undefined && firstOption !== undefined) {
        this.option_objects.set(firstOption, optionContainer);
      }
      
      // Position the container
      optionContainer.setPosition(startX, currentY);
      
      // Set visibility based on current page
      const itemPage = Math.floor(optionIndex / itemsPerPage);
      optionContainer.setVisible(itemPage === this.page_number);
      
      currentY += spacing;
      optionIndex++;
    }
    
    console.log(`Created ${this.option_objects.size} option objects`);
  }

  // Helper function to get a value from the base ruleset using a dot-notation path
  private getValueFromPath(path: string): any {
    if (!path || !this.baseRuleset) return undefined;
    
    const keys = path.split('.');
    let current = this.baseRuleset;
    
    for (const key of keys) {
      if (current === undefined || current === null) return undefined;
      current = current[key];
    }
    
    return current;
  }

  add_category(name: String) {
    // TODO: implement
  }

  add_option(option: Option<any>) {
    // this will call one of the other creation fns as applicable
    // TODO: implement fully
    switch (option.kind) {
      case "NOMINAL":
        this.create_dropdown(option.value as string[], undefined /*for now*/, undefined /*TODO: callback*/);
        break;
      case "NUMERICAL":
        this.create_number_input();
        break;
      case "CHECKBOX":
        this.create_buttons_container(option.name, false, option.value);
        break;
      case "RADIO":
        this.create_buttons_container(option.name, true, option.value);
        break;
      default:
        console.log("what did you do??")
    }
  }

    create_dropdown(options: string[], defaultValue?: string, onSelect?: (selectedOption: string) => void) {
    // Create the dropdown using rex UI
    const dropdown = this.rexUI.add.dropDownList({
      x: 0,
      y: 0,
      background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xE9DFD9).setStrokeStyle(2, 0x101814),
      
      text: this.add.text(0, 0, defaultValue || options[0] || 'Select...', {
        fontSize: '16px',
        color: '#101814'
      }),
      
      space: {
        left: 10,
        right: 10,
        top: 5,
        bottom: 5,
        icon: 10
      },
      
      options: options,
      
      list: {
        createBackgroundCallback: (scene: any) => {
          return scene.rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xffffff).setStrokeStyle(2, 0x101814);
        },
        
        createButtonCallback: (scene: any, option: string) => {
          return scene.rexUI.add.label({
            background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xE9DFD9),
            text: scene.add.text(0, 0, option, {
              fontSize: '16px',
              color: '#101814'
            }),
            space: {
              left: 10,
              right: 10,
              top: 8,
              bottom: 8
            }
          });
        },
        
        onButtonOver: (button: any) => {
          button.getElement('background').setFillStyle(0xEBC9B3);
        },
        
        onButtonOut: (button: any) => {
          button.getElement('background').setFillStyle(0xE9DFD9);
        },
        
        space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10,
          item: 5
        }
      },
      
      setValueCallback: (dropDownList: any, value: any) => {
        dropDownList.text = value;
        if (onSelect) {
          onSelect(value);
        }
      }
    });
    
    dropdown.layout();
    
    return dropdown;
  }

  create_number_input() {

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
       options.forEach((option) => {
         buttons_children.push(this.create_checkbox_button(option, option));
       })
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
    if (name === undefined) {
      name = text;
    }
    var button = this.rexUI.add.label({
      width: 100,
      height: 100,
      text: this.add.text(200, 200, text, {
        fontSize: 18
      }),
      icon: this.add.rectangle(20, 20, 20, 20).setStrokeStyle(1, 0x000000),
      space: {
        left: 10,
        right: 10,
        icon: 10
      },
      name: name
    });
    
    return button;
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
  /*populate_options(width: number, height: number, container_width: number) {
    const startY = height * 0.27;
    const spacing = height * 0.125;

    // TODO: this should handle making each option
  };*/

  // Creates the draw rules UI with radio buttons for whenToDraw
  // TODO: Delete/edit this later, it is only here to show/test that saving rules edits works
  /*createDrawRulesUI(container: Phaser.GameObjects.Container, width: number, height: number) {
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

    const discardOptions = [
      "startOfTurn",
      "endOfTurn",
      "afterPlay",
      "afterDraw",
      "any"
    ];

    const playOptions = [
      "startOfTurn",
      "endOfTurn",
      "afterDraw",
      "afterDiscard",
      "any"
    ];

    let xOffset = 40;
    let yOffset = 40;

    // Create radio buttons for draw timing
    const drawButtons = this.create_buttons_container(
      "When to Draw",
      true,
      drawOptions,
      (selectedOption: string) => {
        this.trackChange('drawRules.whenToDraw', selectedOption);
      }
    );

    drawButtons.getButton(0)!.setName("startOfTurn");
    drawButtons.getButton(1)!.setName("endOfTurn");
    drawButtons.getButton(2)!.setName("afterPlay");
    drawButtons.getButton(3)!.setName("afterDiscard");
    drawButtons.getButton(4)!.setName("any");

    // Position the buttons
    drawButtons.setPosition(startX + xOffset, startY + yOffset);
    drawButtons.setButtonState(this.baseRuleset.drawRules.whenToDraw, true);
    
    container.add(drawButtons);
    
    yOffset += 40;

    const discardButtons = this.create_buttons_container(
      "When to Discard",
      true,
      discardOptions,
      (selectedOption: string) => {
        this.trackChange('drawRules.whenToDiscard', selectedOption);
      }
    );

    // Position the buttons
    discardButtons.setPosition(startX + xOffset, startY + yOffset);
    discardButtons.getButton(0)!.setName("startOfTurn");
    discardButtons.getButton(1)!.setName("endOfTurn");
    discardButtons.getButton(2)!.setName("afterPlay");
    discardButtons.getButton(3)!.setName("afterDraw");
    discardButtons.getButton(4)!.setName("any");
    discardButtons.setButtonState(this.baseRuleset.discardRules.whenToDiscard, true);
    container.add(discardButtons);
    
    yOffset += 40;

    const playButtons = this.create_buttons_container(
      "When to Play",
      true,
      playOptions,
      (selectedOption: string) => {
        this.trackChange('drawRules.whenToPlay', selectedOption);
      }
    );

    // Position the buttons
    playButtons.setPosition(startX + xOffset, startY + yOffset);
    playButtons.getButton(0)!.setName("startOfTurn");
    playButtons.getButton(1)!.setName("endOfTurn");
    playButtons.getButton(2)!.setName("afterDraw");
    playButtons.getButton(3)!.setName("afterDiscard");
    playButtons.getButton(4)!.setName("any");
    playButtons.setButtonState(this.baseRuleset.playRules.whenToPlay, true);
    container.add(playButtons);
    
    yOffset += 40;

    const checkboxOptions = [
      "Allow Empty Draw",
      "Reshuffle Discard",
      "Draw Until Hand Full"
    ];
    
    const checkboxButtons = this.create_buttons_container(
      "Draw Options",
      false,
      checkboxOptions,
      (selectedOption: string) => {
        this.trackChange('drawRules.options', selectedOption);
      }
    );
    
    checkboxButtons.setPosition(startX + xOffset, startY + yOffset);
    container.add(checkboxButtons);
  };*/

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
    const merged: any = JSON.parse(JSON.stringify(this.baseRuleset));

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

  private async getTypes(): Promise<any[]> {
    try {
      const response = await fetch(`/.proxy/api/rulesets/editorFields/${encodeURIComponent(this.name)}`);
      
      if (!response.ok) {
        console.error("Error fetching editor fields:", response.statusText);
        return [];
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching editor fields:", error);
      return [];
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
    /*const example_nominal_option = new Option<string>("NOMINAL", "example nominal option");
    const example_numerical_option = new Option<number>("NUMERICAL", 15);
    const example_checkbox_option = new Option<boolean>("CHECKBOX", true);
    const example_radio_option = new Option<boolean>("RADIO", true);

    this.options.set("Max Players", [new Option<number>("NUMERICAL", this.baseRuleset.maxPlayers)]);
    this.options.set("Min Players", [new Option<number>("NUMERICAL", this.baseRuleset.minPlayers)]);
    
    this.options.set("A Value", [new Option<number>("RADIO", 1), new Option<number>("RADIO", 14)]);
    
    this.options.set("Turn Order", [new Option<string>("RADIO", "clockwise"), new Option<string>("RADIO", "counterclockwise")]);
    
    this.options.set("Who Starts", [new Option<string>("RADIO", "host"), new Option<string>("RADIO", "highestCard"), new Option<string>("RADIO", "lowestCard")]);

    this.options.set("When To Draw", [new Option<string>("RADIO", "startOfTurn"), new Option<string>("RADIO", "endOfTurn"), new Option<string>("RADIO", "afterPlay"), new Option<string>("RADIO", "afterDiscard"), new Option<string>("RADIO", "any")]);
    this.options.set("Minimum Cards to Draw", [new Option<number>("NUMERICAL", this.baseRuleset.drawRules.minCardsToDraw)]);
    this.options.set("Maximum Cards to Draw", [new Option<number>("NUMERICAL", this.baseRuleset.drawRules.maxCardsToDraw)]);
    
    this.options.set("When to Discard", [new Option<string>("RADIO", "endOfTurn"), new Option<string>("RADIO", "afterPlay"), new Option<string>("RADIO", "afterDraw"), new Option<string>("RADIO", "any")]);
    this.options.set("Minimum Cards to Discard", [new Option<number>("NUMERICAL", this.baseRuleset.discardRules.minCardsToDiscard)]);
    this.options.set("Maximum Cards to Discard", [new Option<number>("NUMERICAL", this.baseRuleset.discardRules.maxCardsToDiscard)]);

    this.options.set("When To Play", [new Option<string>("RADIO", "startOfTurn"), new Option<string>("RADIO", "endOfTurn"), new Option<string>("RADIO", "afterDraw"), new Option<string>("RADIO", "afterDiscard"), new Option<string>("RADIO", "any")]);
    this.options.set("Minimum Cards to Play", [new Option<number>("NUMERICAL", this.baseRuleset.playRules.minCardsToPlay)]);
    this.options.set("Maximum Cards to Play", [new Option<number>("NUMERICAL", this.baseRuleset.playRules.maxCardsToPlay)]);

    this.options.set("Starting Hand Size", [new Option<number>("NUMERICAL", this.baseRuleset.startingHandSize)]);
    this.options.set("Max Hand Size", [new Option<number>("NUMERICAL", this.baseRuleset.maxHandSize)]);
    this.options.set("Minimum Hand Size", [new Option<number>("NUMERICAL", this.baseRuleset.minHandSize)]);

    this.options.set("Has Max Num Rounds", [new Option<boolean>("CHECKBOX", this.baseRuleset.hasMaxNumRounds)]);
    this.options.set("Max Num Rounds", [new Option<number>("NUMERICAL", this.baseRuleset.maxNumRounds)]);

    this.options.set("Min Num Rounds", [new Option<number>("NUMERICAL", this.baseRuleset.minNumRounds)]);

    this.options.set("Win Conditions", [new Option<string>("CHECKBOX", "First to a Score"), new Option<string>("CHECKBOX", "First to a Hand Size"), new Option<string>("CHECKBOX", "Most of One Suit"), new Option<string>("CHECKBOX", "Most of One Rank"), new Option<string>("CHECKBOX", "Most of One Color"), new Option<string>("CHECKBOX", "Most Cards in Hand"), new Option<string>("CHECKBOX", "Least Cards in Hand"), new Option<string>("CHECKBOX", "Last to Have Cards in Hand")]);
    this.options.set("Points to Win (if First to a Score is selected)", [new Option<number>("NUMERICAL", this.baseRuleset.pointsToWin)]);
    this.options.set("Hand Size to Win (if First to a Hand Size is selected)", [new Option<number>("NUMERICAL", this.baseRuleset.handSizeToWin)]);
    this.options.set("Most of One Suit - Suit", [new Option<string>("RADIO", "hearts"), new Option<string>("RADIO", "diamonds"), new Option<string>("RADIO", "clubs"), new Option<string>("RADIO", "spades")]);
    this.options.set("Most of One Rank - Rank", [new Option<number>("NUMERICAL", this.baseRuleset.mostOfOneRank.rank)]);
    this.options.set("Most of One Color - Color", [new Option<string>("RADIO", "red"), new Option<string>("RADIO", "black")]);*/
    //  populate_options() {
    // Use editorFields from server if available
    //  populate_options() {
    if (this.editorFields && this.editorFields.length > 0) {
      for (const field of this.editorFields) {
        this.fieldPaths.set(field.label, field.path);

        switch (field.inputKind) {
          case 'numerical':
            this.options.set(field.label, [
              new Option<number>("NUMERICAL", field.label, field.value)
            ]);
            break;
            
          case 'checkbox':
            this.options.set(field.label, [
              new Option<boolean>("CHECKBOX", field.label, field.value)
            ]);
            break;
            
          case 'radio':
            if (field.options && field.options.length > 0) {
              const radioOptions = field.options.map((opt: any) => 
                new Option<any>("RADIO", opt.label, opt.value)
              );
              this.options.set(field.label, radioOptions);
            }
            break;
            
          case 'nominal':
            if (field.options && field.options.length > 0) {
              const nominalOptions = field.options.map((opt: any) => 
                new Option<any>("NOMINAL", opt.label, opt.value)
              );
              this.options.set(field.label, nominalOptions);
            }
            break;
            
          default:
            console.log(`Unknown input kind: ${field.inputKind} for field: ${field.label}`);
        }
      }
      
      console.log(`Populated ${this.options.size} options from editor fields`);
      alert(`Populated ${this.options.size} options from editor fields:\n\n` + JSON.stringify(Array.from(this.options.entries()), null, 2));
    } else {
      // Fallback to manual options
      this.options.set("Max Players", [new Option<number>("NUMERICAL", "Max Players", this.baseRuleset.maxPlayers)]);
      this.options.set("Min Players", [new Option<number>("NUMERICAL", "Min Players", this.baseRuleset.minPlayers)]);
      
      this.options.set("A Value", [
        new Option<number>("RADIO", "1", 1), 
        new Option<number>("RADIO", "14", 14)
      ]);
      
      this.options.set("Turn Order", [
        new Option<string>("RADIO", "Clockwise", "clockwise"), 
        new Option<string>("RADIO", "Counterclockwise", "counterclockwise")
      ]);
      
      // ... update rest of manual options similarly ...
    }
  }
}