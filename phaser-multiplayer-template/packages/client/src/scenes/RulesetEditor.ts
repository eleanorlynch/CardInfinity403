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

  // Custom dropdown container to handle dropdown display (regular rex UI dropdown has some issues with display layering)
  private activeDropdownOverlay: Phaser.GameObjects.Container | null = null;

  init(args: any) {
    this.name = args?.name ?? "";
    this.types = undefined;

    // Clear all instance data when re-entering the scene to avoid reloading issues
    this.options.clear();
    this.option_objects.clear();
    this.fieldPaths.clear();
    this.ruleChanges.clear();
    this.mutuallyExclusiveGroups.clear();
    this.page_number = 1;
    
    // Destroy any active dropdown overlay from previous session to avoid reloading issues
    if (this.activeDropdownOverlay) {
      this.activeDropdownOverlay.destroy();
      this.activeDropdownOverlay = null;
    }
  }

  // maps each category to a list of options
  options: Map<String, Option<any>[]> = new Map();
  option_objects: Map<Option<any>, Phaser.GameObjects.Container> = new Map();
  page_number: number = 1;

  async create() {
    // Load the base ruleset to use for defaults (for new ruleset use default, for existing fetch by name)
    if (this.name !== undefined && this.name !== null && this.name.trim() !== "") {
      this.baseRuleset = await this.fetchRulesetData(this.name);
    } else {
      this.name = "New Ruleset";
      this.baseRuleset = JSON.parse(JSON.stringify(DefaultRulesetData));
    }

    this.editorFields = await this.getTypes();

    const displayName = (this.name && this.name.trim()) ? this.name : "New Ruleset";
    const width = Number(this.game.config.width);
    const height = Number(this.game.config.height);
    const container_width = width * 0.75;
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "background");

    let scaleX = this.cameras.main.width / bg.width + 0.2;
    let scaleY = this.cameras.main.height / bg.height + 0.2;
    let scale = Math.max(scaleX, scaleY);

    bg.setScale(scale).setScrollFactor(0);

    var title_text = this.add
      .text(Number(this.game.config.width) * 0.5, Number(this.game.config.height) * 0.15, displayName, {
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

    this.populate_options();
    this.populate_option_objects(width, height, container_width);
  }


  //Helper fns

    // Handles page navigation. Visibility change should happen here if possible.
  handle_navigation_click(increment: number) {
    const itemsPerPage = 5;
    const totalItems = this.option_objects.size;
    const maxPage = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    
    const newPage = this.page_number + increment;
    
    if (newPage >= 1 && newPage <= maxPage) {
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
      
      const optionContainer = this.add.container(0, 0);
      
      const categoryLabel = this.add.text(0, 0, String(category) + ":", {
        fontFamily: "Arial Black",
        fontSize: "16px",
        color: "#101814",
        padding: { x: 4, y: 4 }
      });
      optionContainer.add(categoryLabel);
      
      const inputXOffset = categoryLabel.width + 30;
      
      const fieldPath = this.fieldPaths.get(String(category));
      const currentValue = fieldPath ? this.getValueFromPath(fieldPath) : undefined;
      
      const firstOption = cat_options[0];
      let inputObject: any;
      
      switch (firstOption?.kind) {
        case "NOMINAL": {
          const nominalOptions = cat_options.filter(opt => opt.kind === "NOMINAL");
          const displayTexts = nominalOptions.map(opt => opt.displayText);
          const values = nominalOptions.map(opt => opt.value);

          if (displayTexts.length > 0) {
            const defaultIndex = currentValue !== undefined
              ? values.indexOf(currentValue)
              : 0;
            const defaultDisplay = displayTexts[defaultIndex >= 0 ? defaultIndex : 0]!;

            const dropdown = this.create_dropdown(
              displayTexts,
              defaultDisplay,
              (selectedDisplay: string) => {
                const path = this.fieldPaths.get(String(category)) || String(category);
                const idx = displayTexts.indexOf(selectedDisplay);
                const selectedValue = idx >= 0 ? values[idx] : selectedDisplay;
                this.trackChange(path, selectedValue);
              }
            );

            dropdown.setPosition(inputXOffset + 100, 10);
            inputObject = dropdown;
            optionContainer.add(dropdown);
          }
          break;
        }
          
        case "NUMERICAL":
          // ...existing code...
          const numValue = currentValue !== undefined ? currentValue : firstOption.value as number;
          
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
          
          const categoryPath = this.fieldPaths.get(String(category)) || String(category);
          
          numLabel.on('pointerdown', () => {
            const canvas = this.game.canvas;
            const canvasRect = canvas.getBoundingClientRect();
            
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
          
        case "CHECKBOX": {
          const checkboxOptions = cat_options.filter(opt => opt.kind === "CHECKBOX");
          const displayTexts = checkboxOptions.map(opt => opt.displayText);
          const values = checkboxOptions.map(opt => opt.value);

          if (displayTexts.length > 0) {
            const categoryPathForCheckbox = this.fieldPaths.get(String(category)) || String(category);
            
            const checkboxButtons = this.create_buttons_container(
              String(category),
              false,
              displayTexts,
              (selectedDisplay: string, isSelected?: boolean) => {
                const path = categoryPathForCheckbox;
                if (isSelected === true) {
                  this.handleMutuallyExclusiveSelection(path, true);
                }
                this.trackChange(path, isSelected === true);
              }
            );

            checkboxButtons.setPosition(inputXOffset + 50, 10);
            inputObject = checkboxButtons;
            optionContainer.add(checkboxButtons);
            
            // Name buttons by their value (not display text) for state management
            for (let i = 0; i < checkboxOptions.length; i++) {
              const valueKey = String(values[i]);
              checkboxButtons.getButton(i)?.setName(valueKey);
            }
            
            if (values[0] !== undefined) {
              this.registerMutuallyExclusiveCheckbox(categoryPathForCheckbox, checkboxButtons, String(values[0]));
            }
            
            if (currentValue === true && values[0] !== undefined) {
              checkboxButtons.setButtonState(String(values[0]), true);
            }
          }
          break;
        }
          
        case "RADIO": {
          const radioOptions = cat_options.filter(opt => opt.kind === "RADIO");
          const displayTexts = radioOptions.map(opt => opt.displayText);
          const values = radioOptions.map(opt => opt.value);

          if (displayTexts.length > 0) {
            const radioButtons = this.create_buttons_container(
              String(category),
              true,
              displayTexts,
              (selectedDisplay: string) => {
                const path = this.fieldPaths.get(String(category)) || String(category);
                const idx = displayTexts.indexOf(selectedDisplay);
                const selectedValue = idx >= 0 ? values[idx] : selectedDisplay;
                this.trackChange(path, selectedValue);
              }
            );

            radioButtons.setPosition(inputXOffset + 100, 10);
            inputObject = radioButtons;
            optionContainer.add(radioButtons);
            
            // Name buttons by their value for state management
            for (let i = 0; i < radioOptions.length; i++) {
              const valueKey = String(values[i]);
              radioButtons.getButton(i)?.setName(valueKey);
            }
            
            if (currentValue !== undefined) {
              const currentValueStr = String(currentValue);
              if (values.map(String).includes(currentValueStr)) {
                radioButtons.setButtonState(currentValueStr, true);
              }
            }
          }
          break;
        }
          
        default:
          console.log(`Unknown option kind: ${firstOption?.kind} for category: ${category}`);
      }
      
      if (inputObject !== undefined && firstOption !== undefined) {
        this.option_objects.set(firstOption, optionContainer);
      }
      
      const yPositionInPage = (optionIndex % itemsPerPage) * spacing;
      optionContainer.setPosition(startX, startY + yPositionInPage);
      
      const itemPage = Math.floor(optionIndex / itemsPerPage) + 1;
      optionContainer.setVisible(itemPage === this.page_number);
      
      optionIndex++;
    }
  }

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
    const self = this;
    
    // Create a simple button that looks like a dropdown
    const dropdownWidth = 200;
    const dropdownBg = this.rexUI.add.roundRectangle(0, 0, dropdownWidth, 30, 0, 0xE9DFD9).setStrokeStyle(2, 0x101814);
    
    const dropdownText = this.add.text(-20, 0, defaultValue || options[0] || 'Select...', {
      fontSize: '16px',
      color: '#101814'
    }).setOrigin(0.5);
    
    const dropdownArrow = this.add.text((dropdownWidth / 2) - 20, 0, '▼', {
      fontSize: '12px',
      color: '#101814'
    }).setOrigin(0.5);
    
    const dropdown = this.add.container(0, 0, [dropdownBg, dropdownText, dropdownArrow]);
    dropdown.setSize(dropdownWidth, 30);
    
    // Make it interactive
    dropdownBg.setInteractive({ useHandCursor: true });
    
    dropdownBg.on('pointerover', () => {
      dropdownBg.setFillStyle(0xEBC9B3);
    });
    
    dropdownBg.on('pointerout', () => {
      dropdownBg.setFillStyle(0xE9DFD9);
    });
    
    dropdownBg.on('pointerdown', () => {
      // Close any existing dropdown overlay
      if (self.activeDropdownOverlay) {
        self.activeDropdownOverlay.destroy();
        self.activeDropdownOverlay = null;
        return;
      }
      
      // Get world position of the dropdown
      const worldMatrix = dropdown.getWorldTransformMatrix();
      const worldX = worldMatrix.tx;
      const worldY = worldMatrix.ty;
      
      // Create the overlay container directly on the scene (not in any container)
      const overlay = self.add.container(worldX, worldY + 20);
      overlay.setDepth(9999);
      self.activeDropdownOverlay = overlay;
      
      // Create background for the list
      const listHeight = options.length * 35 + 10;
      const listBg = self.add.graphics();
      listBg.fillStyle(0xffffff, 1);
      listBg.fillRoundedRect(-dropdownWidth / 2, 0, dropdownWidth, listHeight, 5);
      listBg.lineStyle(2, 0x101814);
      listBg.strokeRoundedRect(-dropdownWidth / 2, 0, dropdownWidth, listHeight, 5);
      overlay.add(listBg);
      
      // Create option buttons
      options.forEach((option, index) => {
        const optionBg = self.add.rectangle(0, 15 + index * 35, dropdownWidth - 10, 30, 0xE9DFD9);
        optionBg.setInteractive({ useHandCursor: true });
        
        const optionText = self.add.text(0, 15 + index * 35, option, {
          fontSize: '16px',
          color: '#101814'
        }).setOrigin(0.5);
        
        optionBg.on('pointerover', () => {
          optionBg.setFillStyle(0xEBC9B3);
        });
        
        optionBg.on('pointerout', () => {
          optionBg.setFillStyle(0xE9DFD9);
        });
        
        optionBg.on('pointerdown', () => {
          // Update the dropdown text
          dropdownText.setText(option);
          
          // Call the callback
          if (onSelect) {
            onSelect(option);
          }
          
          // Close the overlay
          overlay.destroy();
          self.activeDropdownOverlay = null;
        });
        
        overlay.add(optionBg);
        overlay.add(optionText);
      });
      
      // Close dropdown when clicking elsewhere
      const closeListener = (pointer: Phaser.Input.Pointer) => {
        // Check if click is outside the overlay
        const bounds = overlay.getBounds();
        if (!bounds.contains(pointer.x, pointer.y)) {
          overlay.destroy();
          self.activeDropdownOverlay = null;
          self.input.off('pointerdown', closeListener);
        }
      };
      
      // Delay adding the listener to avoid immediate close
      self.time.delayedCall(100, () => {
        self.input.on('pointerdown', closeListener);
      });
    });
    
    // Store the text reference so we can read the current value
    (dropdown as any).text = defaultValue || options[0];
    (dropdown as any).getText = () => dropdownText.text;
    (dropdown as any).setText = (value: string) => {
      dropdownText.setText(value);
      (dropdown as any).text = value;
    };
    
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

  // Creates a singular checkbox button
  create_checkbox_button(text: string, name: string) {
    if (name === undefined || name === null) {
      name = text;
    }
    var button = this.rexUI.add.label({
      width: 100,
      height: 100,
      text: this.add.text(200, 200, text, {
        fontSize: 18,
        color: '#E9DFD9'
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
        fontSize: 18,
        color: '#101814'
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
    const maxPage = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    
    // Clamp page number to valid range (1-based)
    if (this.page_number > maxPage) {
      this.page_number = maxPage;
    }

    if (this.page_number < 1) {
      this.page_number = 1;
    }
    
    // Hide all options first
    for (const [option, optionContainer] of this.option_objects.entries()) {
      optionContainer.setVisible(false);
    }
    
    // Calculate which items to show (convert page number to 0-based index)
    const startIndex = (this.page_number - 1) * itemsPerPage;
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
        return;
      }

      const savedRuleset = await response.json();
      console.log("Ruleset saved successfully:", savedRuleset);
      const savedTo = savedRuleset.savedTo === "neon" ? "Neon" : "locally";
      
      // Clear in-memory changes after successful save
      this.ruleChanges.clear();
      console.log("Cleared in-memory rule changes after successful save");
    } catch (error) {
      console.error("Error saving ruleset:", error);
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
              new Option<number>("NUMERICAL", field.label, field.value, field.displayText)
            ]);
            break;
            
          case 'checkbox':
            this.options.set(field.label, [
              new Option<boolean>(
                "CHECKBOX",
                field.label,
                field.value,
                field.displayText ?? field.optionText ?? String(field.value)
              )
            ]);
            break;
            
          case 'radio':
            if (field.options && field.options.length > 0) {
              const radioOptions = field.options.map((opt: any) =>
                new Option<any>(
                  "RADIO",
                  opt.label,
                  opt.value,
                  opt.displayText ?? opt.text ?? opt.label ?? String(opt.value)
                )
              );
              this.options.set(field.label, radioOptions);
            }
            break;
            
          case 'nominal':
            if (field.options && field.options.length > 0) {
              const nominalOptions = field.options.map((opt: any) =>
                new Option<any>(
                  "NOMINAL",
                  opt.label,
                  opt.value,
                  opt.displayText ?? opt.text ?? opt.label ?? String(opt.value)
                )
              );
              this.options.set(field.label, nominalOptions);
            }
            break;
            
          default:
            console.log(`Unknown input kind: ${field.inputKind} for field: ${field.label}`);
        }
      }
      
      console.log(`Populated ${this.options.size} options from editor fields`);
    } else {
      console.log("No editor fields found to populate options");
    }
  }
}