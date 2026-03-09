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

  // Track mutually exclusive checkbox groups
  private mutuallyExclusiveGroups: Map<string, { paths: string[], buttons: Map<string, any> }> = new Map();


  init(args: any) {
    // TODO: remove (replace really) below line once we're passing in the actual ruleset
    this.name = args.name;
    this.types = undefined;;
  }

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
   // alert("Types are:\n\n" + JSON.stringify(this.editorFields, null, 2));

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
      const textEditor = this.rexUI.edit(title_text);
      textEditor.on('close', () => {
        // Update the ruleset name when editing is complete
        alert(title_text.text);
        this.trackChange("name", title_text.text);
      });
    });

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

    this.populate_options();
    this.populate_option_objects(width, height, container_width);
  }


  //Helper fns

  // Handles page navigation. Visibility change should happen here if possible.
  handle_navigation_click(increment: number) {
    const itemsPerPage = 5;
    const totalItems = this.option_objects.size;
    const maxPage = Math.max(0, Math.ceil(totalItems / itemsPerPage) - 1);
    
    const newPage = this.page_number + increment;
    
    if (newPage >= 0 && newPage <= maxPage) {
      this.page_number = newPage;
    }
  }

  // Populates display objects for each category and option
  populate_option_objects(width: number, height: number, container_width: number) {
    const startX = width * 0.15;
    const startY = height * 0.27;
    const spacing = height * 0.1;
    const itemsPerPage = 5;
    
    let optionIndex = 0;

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
      
      // Calculate input x position based on label width with some padding
      const inputXOffset = categoryLabel.width + 30;
      
      // Get current value from base ruleset using the field path
      const fieldPath = this.fieldPaths.get(String(category));
      const currentValue = fieldPath ? this.getValueFromPath(fieldPath) : undefined;
      
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
            // Use current value from ruleset, or fall back to first option
            const defaultDropdownValue = currentValue !== undefined 
              ? String(currentValue) 
              : dropdownOptions[0];
            
            const dropdown = this.create_dropdown(
              dropdownOptions,
              defaultDropdownValue,
              (selectedOption: string) => {
                const path = this.fieldPaths.get(String(category)) || String(category);
                this.trackChange(path, selectedOption);
              }
            );

            dropdown.setPosition(inputXOffset + 50, 10);
            inputObject = dropdown;
            optionContainer.add(dropdown);
          }
          break;
          
        case "NUMERICAL":
          // Number input - use current value from ruleset
          const numValue = currentValue !== undefined ? currentValue : firstOption.value as number;
          
          // Add border/background first (so it's behind the text)
          const numBg = this.add.rectangle(inputXOffset + 40, 12, 80, 30)
            .setStrokeStyle(2, 0x101814)
            .setFillStyle(0xffffff)
            .setOrigin(0.5);
          optionContainer.add(numBg);
          
          const numLabel = this.add.text(inputXOffset + 40, 12, `${numValue}`, {
            fontFamily: "Arial",
            fontSize: "16px",
            color: "#101814",
            padding: { x: 10, y: 5 }
          })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
          optionContainer.add(numLabel);
          
          // Store category for use in callback
          const categoryPath = this.fieldPaths.get(String(category)) || String(category);
          
          numLabel.on('pointerdown', () => {
            // Create a native HTML input for editing
            const canvas = this.game.canvas;
            const canvasRect = canvas.getBoundingClientRect();
            
            // Calculate screen position
            const worldPoint = optionContainer.getWorldTransformMatrix();
            const screenX = canvasRect.left + worldPoint.tx + inputXOffset;
            const screenY = canvasRect.top + worldPoint.ty;
            
            const input = document.createElement('input');
            input.type = 'number';
            input.value = numLabel.text;
            input.style.position = 'absolute';
            input.style.left = `${screenX}px`;
            input.style.top = `${screenY}px`;
            input.style.fontSize = '16px';
            input.style.width = '80px';
            input.style.height = '30px';
            input.style.zIndex = '1000';
            input.style.border = '2px solid #101814';
            input.style.padding = '4px';
            input.style.textAlign = 'center';
            
            document.body.appendChild(input);
            input.focus();
            input.select();
            
            const handleBlur = () => {
              const newValue = parseInt(input.value);
              if (!isNaN(newValue)) {
                numLabel.setText(`${newValue}`);
                this.trackChange(categoryPath, newValue);
              }
              if (input.parentNode) {
                input.remove();
              }
            };
            
            input.addEventListener('blur', handleBlur);
            input.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                input.blur();
              } else if (e.key === 'Escape') {
                if (input.parentNode) {
                  input.remove();
                }
              }
            });
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
            const categoryPathForCheckbox = this.fieldPaths.get(String(category)) || String(category);
            
            const checkboxButtons = this.create_buttons_container(
              String(category),
              false,
              checkboxOptions,
              (selectedOption: string, isSelected?: boolean) => {
                const path = categoryPathForCheckbox;
                // Handle mutually exclusive groups (only one person can start, for example)
                if (isSelected === true) {
                  this.handleMutuallyExclusiveSelection(path, true);
                }
                // Track the boolean state
                this.trackChange(path, isSelected === true);
              }
            );

            checkboxButtons.setPosition(inputXOffset + 50, 10);
            inputObject = checkboxButtons;
            optionContainer.add(checkboxButtons);
            
            // Set button names first
            for (let i = 0; i < checkboxOptions.length; i++) {
              const optionName = checkboxOptions[i];

              if (optionName) {
                checkboxButtons.getButton(i)?.setName(optionName);
              }
            }
            
            // Register for mutually exclusive handling
            if (checkboxOptions[0]) {
              this.registerMutuallyExclusiveCheckbox(categoryPathForCheckbox, checkboxButtons, checkboxOptions[0]);
            }
            
            // Set initial state based on current value from ruleset
            if (currentValue === true && checkboxOptions[0]) {
              checkboxButtons.setButtonState(checkboxOptions[0], true);
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

            radioButtons.setPosition(inputXOffset + 100, 10);
            inputObject = radioButtons;
            optionContainer.add(radioButtons);
            
            // Set button names for state management
            for (let i = 0; i < radioOptions.length; i++) {
              const optionName = radioOptions[i];

              if (optionName) {
                radioButtons.getButton(i)?.setName(optionName);
              }
            }
            
            // Set initial selected state based on current value from ruleset
            if (currentValue !== undefined) {
              const currentValueStr = String(currentValue);

              if (radioOptions.includes(currentValueStr)) {
                radioButtons.setButtonState(currentValueStr, true);
              }
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
      
      // Position the container - use modulo for Y position within page
      const yPositionInPage = (optionIndex % itemsPerPage) * spacing;
      optionContainer.setPosition(startX, startY + yPositionInPage);
      
      // Set initial visibility based on current page
      const itemPage = Math.floor(optionIndex / itemsPerPage);
      optionContainer.setVisible(itemPage === this.page_number);
      
      optionIndex++;
    }
  };

  // Helper function to get a value from the base ruleset using a dot-notation path
  private getValueFromPath(path: string): any {
    if (path === null || path === undefined || this.baseRuleset === null || this.baseRuleset === undefined) {
      return undefined;
    }
    
    const keys = path.split('.');
    let current = this.baseRuleset;
    
    for (const key of keys) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  add_category(name: String) {
    // TODO: implement (might not be necessary)
  }

  // TODO: Figure out if current implementation should be changed to use this
  add_option(option: Option<any>) {
    // this will call one of the other creation fns as applicable
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
        
        createButtonCallback: (scene: any, option: string, index: number, options: any) => {
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
            },
            name: option
          });
        },
        
        onButtonClick: (button: any, index: number, pointer: any, event: any) => {
          // Get the selected option text
          const selectedValue = button.text || button.name;
          
          // Update the dropdown display text
          dropdown.text = selectedValue;
          
          // Call the callback if provided
          if (onSelect !== undefined) {
            onSelect(selectedValue);
          }
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
      
      value: defaultValue || options[0]
    });
    
    dropdown.layout();
    
    return dropdown;
  }

  create_number_input() {
    // TODO: maybe implement this
  }

  // Creates a row w/ buttons
  create_buttons_container(title: string, radio: boolean, options: string[], onSelect?: (selectedOption: string, isSelected?: boolean) => void) {
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
        
        if (onSelect !== undefined) {
          // Always call onSelect with the button name and the new value
          onSelect((button as any).name, value);
        }
      }
    })
      .layout();

    return buttons;
  }

// ...existing code...

  // Creates a singular checkbox button
  create_checkbox_button(text: string, name: string) {
    if (name === undefined || name === null) {
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
    if (name === undefined || name === null) {
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

  // Define which fields are mutually exclusive (only one can be true at a time)
  private getMutuallyExclusiveGroup(path: string): string | null {
    // Define groups of mutually exclusive options
    const whoStartsFields = [
      'startRules.host.chosen',
      'startRules.highestCard.chosen', 
      'startRules.lowestCard.chosen',
      'startRules.mostOfOneSuit.chosen',
      'startRules.mostOfOneRank.chosen'
    ];
    
    if (whoStartsFields.includes(path)) {
      return 'whoStarts';
    }
    
    // TODO: Add more mutually exclusive groups here as needed
    
    return null;
  }

  // Register a checkbox button for a mutually exclusive group
  private registerMutuallyExclusiveCheckbox(path: string, buttonContainer: any, buttonName: string) {
    const groupName = this.getMutuallyExclusiveGroup(path);

    if (groupName === null) {
      return;
    }
    
    if (!this.mutuallyExclusiveGroups.has(groupName)) {
      this.mutuallyExclusiveGroups.set(groupName, { paths: [], buttons: new Map() });
    }
    
    const group = this.mutuallyExclusiveGroups.get(groupName)!;

    if (!group.paths.includes(path)) {
      group.paths.push(path);
    }

    group.buttons.set(path, { container: buttonContainer, buttonName: buttonName });
  }

  // Handle mutually exclusive checkbox selection - uncheck others in the same group
  private handleMutuallyExclusiveSelection(path: string, isSelected: boolean) {
    const groupName = this.getMutuallyExclusiveGroup(path);

    if (groupName === null || !isSelected) {
      return;
    }
    
    const group = this.mutuallyExclusiveGroups.get(groupName);

    if (group === undefined) {
      return;
    }
    
    // Uncheck all other checkboxes in this group and track the changes
    for (const [otherPath, buttonInfo] of group.buttons.entries()) {

      if (otherPath !== path) {
        // Uncheck the button visually
        buttonInfo.container.setButtonState(buttonInfo.buttonName, false);
        // Track the change as false
        this.trackChange(otherPath, false);
      }
    }
  }

  // Hides and shows options while navigating
  handle_visibility() {
    const itemsPerPage = 5;
    const totalItems = this.option_objects.size;
    const maxPage = Math.max(0, Math.ceil(totalItems / itemsPerPage) - 1);
    
    // Clamp page number to valid range
    if (this.page_number > maxPage) {
      this.page_number = maxPage;
    }

    if (this.page_number < 0) {
      this.page_number = 0;
    }
    
    // Hide all options first
    for (const [option, optionContainer] of this.option_objects.entries()) {
      optionContainer.setVisible(false);
    }
    
    // Calculate which items to show
    const startIndex = this.page_number * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    
    // Show only options for current page
    let currentIndex = 0;
    for (const [option, optionContainer] of this.option_objects.entries()) {

      if (currentIndex >= startIndex && currentIndex < endIndex) {
        optionContainer.setVisible(true);
      }
      currentIndex++;
    }
    
    console.log(`Showing page ${this.page_number}: items ${startIndex} to ${endIndex - 1} of ${totalItems}`);
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

  populate_options() {
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
      //alert(`Populated ${this.options.size} options from editor fields:\n\n` + JSON.stringify(Array.from(this.options.entries()), null, 2));
    } else {
      console.log("No editor fields found to populate options");
      alert("Couldn't find any rules for you to edit!");
    }
  }
}