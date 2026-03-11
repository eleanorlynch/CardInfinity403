const assert = require("node:assert");
const OptionModule = require("../phaser-multiplayer-template/packages/client/src/rules/Option.ts");
const { Option } = OptionModule;

describe ("Option", function () {

  describe ("#constructor()", function () {

    it ("should set the kind correctly", function () {
      const option = new Option("NUMERICAL", "maxRounds", 5);
      assert.strictEqual(option.kind, "NUMERICAL");
    });

    it ("should set the name correctly", function () {
      const option = new Option("NUMERICAL", "maxRounds", 5);
      assert.strictEqual(option.name, "maxRounds");
    });

    it ("should set the value correctly for a number", function () {
      const option = new Option("NUMERICAL", "maxRounds", 5);
      assert.strictEqual(option.value, 5);
    });

    it ("should set the value correctly for a string", function () {
      const option = new Option("NOMINAL", "suit", "hearts");
      assert.strictEqual(option.value, "hearts");
    });

    it ("should set the value correctly for a boolean", function () {
      const option = new Option("CHECKBOX", "allowJokers", true);
      assert.strictEqual(option.value, true);
    });

    it ("should default displayText to the string representation of value when not provided", function () {
      const option = new Option("NUMERICAL", "maxRounds", 5);
      assert.strictEqual(option.displayText, "5");
    });

    it ("should use the provided displayText when given", function () {
      const option = new Option("NUMERICAL", "maxRounds", 5, "Maximum Rounds");
      assert.strictEqual(option.displayText, "Maximum Rounds");
    });

    it ("should set NOMINAL kind correctly", function () {
      const option = new Option("NOMINAL", "cardSuit", "spades");
      assert.strictEqual(option.kind, "NOMINAL");
    });

    it ("should set RADIO kind correctly", function () {
      const option = new Option("RADIO", "turnOrder", "clockwise");
      assert.strictEqual(option.kind, "RADIO");
    });

    it ("should set CHECKBOX kind correctly", function () {
      const option = new Option("CHECKBOX", "allowJokers", false);
      assert.strictEqual(option.kind, "CHECKBOX");
    });

    it ("should set CATEGORY kind correctly", function () {
      const option = new Option("CATEGORY", "deckType", "standard");
      assert.strictEqual(option.kind, "CATEGORY");
    });

    it ("should default displayText to 'false' for a false boolean value", function () {
      const option = new Option("CHECKBOX", "allowJokers", false);
      assert.strictEqual(option.displayText, "false");
    });
  });
});
