import { Ruleset } from "../../../server/src/card-game/RulesetTypes"

// TODO: make this class extend Ruleset
export class RulesetClass {
    name: string;

    // Makes a new RulesetClass with the given information.
    constructor(name: string = "") {
        this.name = name;
    }

}