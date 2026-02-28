# CardInfinity403

CURRENT VERSION: 1.0.0-g

## Living Document
https://docs.google.com/document/d/1vaf-CghzvI5Mc5vX6ApmFMtWVwOa-FC2knaWr3sJ9AI/edit?usp=sharing

## Product Description
Card Infinity is a free customizable Discord app where you can set up an online card game with other player(s). Users can set certain conditions and rules of games themselves from a set list (ie. discard pile rules, hand rules, etc.) or choose from a list of precreated games. The interface will consist of the “table”, where cards are set out for play, and the users’ “hands” of cards if relevant to the current game. This will be in the form of a Discord app in order to make communication simpler and allow people to play with each other while on a call. If time allows, additional factors besides cards can be included, such as tokens and dice.

## Beta Use Case
The beta release (tag 1.0.0-b) allows up to two users to play a very simple game of Uno through Discord. Clicking "Start Game" will add the user to a current lobby with only one person, or if no such lobby exists, creates a new one. The game starts with a single, randomly-drawn card placed face up on the table, and players take turns playing cards that match either the suit or rank of the last-played card. If a user cannot play a card, then they must draw a card, though they are also able to choose to draw a card even if they are able to play a card. A user may only draw once or play a single card during their turn, after which they are barred from any action other than ending their turn by clicking on the "End Turn" button. As by typical Uno rules, the first player to empty their hand wins. 

We are currently combining the usage of "Start Game" and "Join Game" for the sake of time, though in the full release this will not be how joining a lobby works. Similarly, while rules are currently implemented, the ability to create and manage them are not; the only ruleset right now is hardcoded to be our simplified version of Uno.

# User Manual
Check out USER_MANUAL.md for more specific user information than this README provides: https://github.com/eleanorlynch/CardInfinity403/blob/main/USER_MANUAL.md 

# Developer Guidelines

## Source Code

All source code for this project can be found in this repository. Dependencies are listed in package.json. Dependencies can be installed by running `npm i` in the root directory.

## Repo Layout (Relevant)

```
CardInfinity403
│   README.md (you are here)
│
└───StatusReports
│
└───coverage
│   │   index.html
│
└───node_modules
│
└───phaser-multiplayer-template
│   │
│   └───packages
│       │
│       └───client
│       │   │   d.ts
│       │   │   vite.config.ts
│       │   │
│       │   └───public
│       │   │   │
│       │   │   └───assets
│       │   │   
│       │   └───src
│       │       │   main.ts
│       │       │   wsPatch.ts
│       │       │
│       │       └───scenes
│       │       │
│       │       └───utils
│       │
│       └───server
│           │   environment.d.ts 
│           │      
│           └───src
│               │   database.ts
│               │   rulesetDb.ts
│               │   server.ts
│               │
│               └───card-game
│               │
│               └───rooms
│               │
│               └───schemas
│
└───test
```

### ./StatusReports/

Holds the status report for each week.

### ./coverage/

Holds the c8-generated coverage reports. Run ./coverage/index.html for a human-readable report.

### ./node-modules/
Contains third-party packages necessary for c8 to run through Github. Notably does not contain all necessary packages for the project as a whole, these can be retrieved through `npm i` in the root directory

### phaser-multiplayer-template/packages/client/
Contains most/all data pertaining to the client

### phaser-multiplayer-template/packages/client/d.ts
Extra type declarations for custom typechecking. See https://www.typescriptlang.org/docs/handbook/2/type-declarations.html 

### phaser-multiplayer-template/packages/client/vite.config.ts
Vite config file. See https://vite.dev/config/ 

### phaser-multiplayer-template/packages/client/public/assets/
Contains necessary clientside assets. Generally for media such as visual/audio files.

### phaser-multiplayer-template/packages/client/src/wsPatch.ts
Temporary patch to allow the application to run through Safari.

### phaser-multiplayer-template/packages/client/main.ts
The entry point for the clientside interface. The main Phaser game config is declared here. 

### phaser-multiplayer-template/packages/client/src/scenes/
Contains clientside scenes. When adding a scene, make sure to also include it in the config settings in ../main.ts or else it will be unusable.

### phaser-multiplayer-template/packages/client/src/utils/
Contains clientside helper classes/functions.

### phaser-multiplayer-template/packages/server/
Contains data pertaining to the server

### phaser-multiplayer-template/packages/server/environment.d.ts
Contains necessary serverside environmental variables. 

### phaser-multiplayer-template/packages/server/src/database.ts
Handles overhead for user/ruleset databases.

### phaser-multiplayer-template/packages/server/src/rulesetDb.ts
Specifically defines/handles the structure/data of the ruleset database.

### phaser-multiplayer-template/packages/server/src/server.ts
Handles server api requests

### phaser-multiplayer-template/packages/server/src/card-game/
Contains serverside helper classes/functions.

### phaser-multiplayer-template/packages/server/src/rooms/
Contains public game room data. 

### phaser-multiplayer-template/packages/server/src/schemas/
Contains schema encodings for serverside data. For structures that need to be more strictly defined than an interface would allow.

### ./test
Contains project tests. See "How to Add a New Test to the Codebase" for more information.

## How to Add a New Test to the Codebase

1. Ensure that you have the keyword “export” in front of any class declarations in a file you intend to test.
2. Go to the ./test directory, then search for a file named *FileName*Tests.spec.ts, where *FileName* is the name of the file you want to write a test for. If you do not find one, create one in this folder.
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

## Fresh Setup/Installation

### DISCLAIMER

This is for setting up a personal instance of the application. If you want to use ours, use this installation link: https://discord.com/oauth2/authorize?client_id=1471216962213511294
Please be aware that our current hosting service is EXTREMELY temporary and that this link will not be working most of the time for now. If you want to run the app on your own time, we'd recommend setting up a personal instance. 

### PREREQUISITES
A current version of npm and pnpm must be installed, 
Instructions for setting up npm can be found here: https://www.ramotion.com/blog/how-to-install-npm/
Instructions for setting up pnpm: https://pnpm.io/cli/setup 

1) Clone repository  
2) Navigate into the phaser-multiplayer-template directory   
3) Run npm install  
4) Run npm run dev  

### IF RUNNING THROUGH LOCALHOST 
***(easier, but with limited capabilities. Recommended for testing)***  
1) Go to http://localhost:3000/, you can access a singleplayer game through here.
   * Note that this can currently only handle singleplayer connections
   ** This is the only step. lol.  

### IF RUNNING AS A DISCORD ACTIVITY
You will need to set up an activity through the Discord developer portal.
You can create a new application here: https://discord.com/developers/applications/ 
To access this page, you will need to have a Discord account with 2FA enabled. 
Instructions for setting up 2FA in Discord can be found here: https://support.discord.com/hc/en-us/articles/219576828-Setting-up-Multi-Factor-Authentication

1) In the Discord dev portal applications screen, create a new Discord activity through the "New Activity" button at the top right of the screen.  
2) Go to the OAuth2 tab under the Settings section of your activity through the Discord developer portal and add https://127.0.0.1 as a new redirect under Redirects.  
3) Open example.env and put the client id and client secret keys from your OAuth2 page into the values for VITE_CLIENT_ID and CLIENT_SECRET respectively with no quotes (You may need to reset the client secret on the app in order to do this. Rename example.env to .env and ensure the NODE_ENV value is set to 'production' (including quotes).  
   *Whenever you reset this secret, make sure to update it here as well or the app will not work afterwards.  
4) Within CardInfinity403/phaser-multiplayer-template/ run 'npm run client-build' to build the client. Then 'cd ./packages/server/' and make sure the server is running in production mode with 'npm run start:prod'. Client and server should both be listening on localhost:3000. Open a new terminal window in the phaser-multiplayer-template directory and run 'cloudflared tunnel --url http://localhost:3000'.  
5) Copy the generated cloudflared link, go to the Discord developer portal for your activity, and navigate to the URL Mappings tab under the Activities section. Paste the link here.  
   *Every time you run 'cloudflared tunnel --url http://localhost:3000' you will need to update this mapping due to cloudflared only providing temporary hosting services. This is annoying and something we are working on fixing, but we have not found a better solution yet.
6) Scroll down to the Settings tab under the Activities section (As opposed to the Settings section higher up) and make sure that "Enable Activities" is set to true. This setting will not be able to be changed if no URL mapping has been set.   
7) Scroll to the Installation tab under the Settings section and open the installation link. It should prompt you to open Discord through the non-developer interface and ask you to add the activity. You can either add it to a specific server or to your apps; choosing a specific server means that anyone in that server can use this activity in that server, while adding it to your apps allows you to start the app in any server or dm.  
8) If you added it to a server, navigate to a text or voice channel within that server, open the Activities menu, and you should be able to launch the activity from there.  
9) If you added it to your apps, navigate to any Discord chat or call and open the Activities menu. You should be able to launch the activity through here.  


## How to Generate a Coverage Report

This is automatically done by running the workflow Node.js CI (see step 7 of "How to Add a New Test to the Codebase" for steps on how to do this). After navigating to the results page for the workflow run and viewing its different parts, click on "Check test code coverage (goal 80%). Scroll down until you see a table. Look for the files you want to check the coverage of in the left-most Files column, and the rest of the columns tell you about their coverage.
If you would like to see the color-coded version, you can manually run "npm run coverage" in your terminal while in the CardInfinity403 directory. Scroll down past the test results to see the coverage report. Red means a file is barely or not at all covered, yellow means it is partially covered, and green means it is sufficiently covered (the current target for green is 80% coverage).
o change what command is executed for "npm run coverage", go to CardInfinity403/package.json, then modify "coverage" under "scripts".

Note that code coverage is currently incomplete due to some features being impossible to test using the hard-coded ruleset being used for the beta release.

## How to Build a Release 

1) Ensure all tests are passing (See step 7 of "How to Add a New Test to the Codebase").  
2) Tag the commit you wish to release. Instructions for tagging may be found here: https://git-scm.com/book/en/v2/Git-Basics-Tagging
* This project uses lightweight tags and follows the format "x.y.z-a" where x is the major version, y is the minor version, z is the patch version, and a is the specific category under which it is released (ex: b, g, f for beta, gamma, full)  
3) Push the commit and tag to the remote repository
4) As a general sanity check, try to launch and/or join a game. 

