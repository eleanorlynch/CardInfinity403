# CardInfinity403

## Living Document
https://docs.google.com/document/d/1vaf-CghzvI5Mc5vX6ApmFMtWVwOa-FC2knaWr3sJ9AI/edit?usp=sharing

## Product Description
Card Infinity is a free customizable Discord app where you can set up an online card game with other player(s). Users can set certain conditions and rules of games themselves from a set list (ie. discard pile rules, hand rules, etc.) or choose from a list of precreated games. The interface will consist of the “table”, where cards are set out for play, and the users’ “hands” of cards if relevant to the current game. This will be in the form of a Discord app in order to make communication simpler and allow people to play with each other while on a call. If time allows, additional factors besides cards can be included, such as tokens and dice.

## Repo Layout (Under Construction)

### Status Reports

Holds the status report for each week.

### Client

Holds the code for client-side and the discordSDK file

### Server

Holds the code for server-side and current has a placeholder file server.js

## How to Add a New Test to the Codebase

1. Ensure that you have the keyword “export” in front of any class declarations in a file you intend to test.
2. Go to the folder “test”, then search for a file named *FileName*Tests.spec.ts, where *FileName* is the name of the file you want to write a test for. If you do not find one, create one in this folder.
3. In *FileName*Tests.spec.ts, if this file is completely new: 
* Add “import assert from "node:assert";” and “import { *ClassName* } from "../*path/to/directory*/*FileName*.ts";”, where *ClassName* is the name of the class exported in the file that you wish to test and *path/to/directory* is the path to the directory which *FileName*.ts is in. Add the latter line again for any other classes which you expect to need to use for testing purposes in this file.
* Then, add a “describe("*ClassName*", function () { … });”, which will wrap the entirety of your tests for that class. This causes the tests to output *ClassName* to indicate which class is being tested.
4. Now, within that describe add “describe("#*functionName*()", function () { … });”, where *functionName* is the name of the function you want to test. This causes the tests to output #*functionName*() to indicate which function is being tested.
5. Then, within that describe add “it("should return x when y", function () { … });”, where x is the expected return value for the function and y is the input/trigger for the function. This causes the tests to output the expected behavior of a function when testing it. You can use multiple its within the same describe for more complicated functions.
6. Within that it, use assert statement(s) (ex. assert.equal(), assert.strictEqual(), assert.deepStrictEqual) to check if a function gives a particular output given a particular input. As an example, this could look like assert.strictEqual(Add.onePlusOne(), 2), which checks if the function adding one plus one has an output strictly equal to 2. Note that strictEqual is equivalent to === while equal is equivalent to ==, so use strictEqual when possible since it is more rigorous. deepStrictEqual() is to be used when you want to check for both structure and value (ex. when you want to see if two objects are identical without them actually having to be the same instance of an object). Add any necessary declarations (const, object, etc.) in order to facilitate the tests.
7. To run the tests automatically, go to Actions -> Node.js CI -> Branch [Select the branch you want to run the tests in] -> Run workflow [Select the branch you want the workflow from, choose main if you have no pending changes to the workflow you want to test] -> Run workflow. This will run npm test in GitHub for you. After running the workflow, click on the new workflow run that shows up in the **workflow runs** table. Then, click on the "1 job completed" in the Matrix: build box, then click on "build (22.x)". Lastly, click on "Run tests" to see the test results for each function/branch. These tests will automatically run once per day, whenever a pull request is made from main, and whenever something is pushed to main or the release build.
If you would like to run the tests manually, you can run “npm test” in your terminal while in the CardInfinity403 directory. Make sure to use “git pull” to update to the most recent version of your test files before doing this.
To change what command is executed for "npm test", go to CardInfinity403/package.json, then modify "test" under "scripts".

Note that the "ExperimentalWarning" which pops up before the test results can be safely ignored.

## How to Build/Test the System

See step 7 of How to Add a New Test to the Codebase.

## How to Generate a Coverage Report

This is automatically done by running the workflow Node.js CI (see step 7 of How to Add a New Test to the Codebase for steps on how to do this). After navigating to the results page for the workflow run and viewing its different parts, click on "Check test code coverage (goal 80%). Scroll down until you see a table. Look for the files you want to check the coverage of in the left-most Files column, and the rest of the columns tell you about their coverage.
If you would like to see the color-coded version, you can manually run "npm run coverage" in your terminal while in the CardInfinity403 directory. Scroll down past the test results to see the coverage report. Red means a file is barely or not at all covered, yellow means it is partially covered, and green means it is sufficiently covered (the current target for green is 80% coverage).
o change what command is executed for "npm run coverage", go to CardInfinity403/package.json, then modify "coverage" under "scripts".

Note that code coverage is currently incomplete due to some features being impossible to test using the hard-coded ruleset being used for the beta release.
