# CardInfinity403

CURRENT VERSION: 1.0.0

## Living Document
https://docs.google.com/document/d/1vaf-CghzvI5Mc5vX6ApmFMtWVwOa-FC2knaWr3sJ9AI/edit?usp=sharing

## Product Description
Card Infinity is a free customizable Discord app where you can set up an online card game with other player(s). Users can set certain conditions and rules of games themselves from a set list (ie. discard pile rules, hand rules, etc.) or choose from a list of precreated games. The interface will consist of the “table”, where cards are set out for play, and the users’ “hands” of cards if relevant to the current game. This will be in the form of a Discord app in order to make communication simpler and allow people to play with each other while on a call. If time allows, additional factors besides cards can be included, such as tokens and dice.

# User Manual
Check out USER_MANUAL.md for more specific user information than this README provides: https://github.com/eleanorlynch/CardInfinity403/blob/main/USER_MANUAL.md 

# Developer Guidelines

Check out CONTRIBUTING.md for information on how to contribute (good luck):  
[LINK IT HERE] 

## Source Code

All source code for this project can be found in this repository. Dependencies are listed in package.json. Dependencies can be installed by running `npm i` in the root directory.

## Repo Layout (Relevant)

```
CardInfinity403
│   README.md (you are here)
│
└───StatusReports                     #Weekly development status reports
│
└───coverage                          #c8-generated coverage reports.
│   │   index.html                    #Generated with ./coverage/index.html
│ 
└───node_modules                      #Required 3rd party packages
│
└───phaser-multiplayer-template       
│   │
│   └───packages
│       │
│       └───client                    #Data pertaining to client
│       │   │   d.ts                  #Typechecking declarations
│       │   │   vite.config.ts        #Vite config; See https://vite.dev/config/  
│       │   │
│       │   └───public
│       │   │   │
│       │   │   └───assets            #Clientside asset files
│       │   │   
│       │   └───src
│       │       │   main.ts           #Main entrypoint
│       │       │   wsPatch.ts        #Websocket Patch
│       │       │
│       │       └───scenes            #Clientside scenes
│       │       │
│       │       └───utils             #Clientside helper classes/functions
│       │
│       └───server                    #Data pertaining to server
│           │   environment.d.ts      #Environmental variables
│           │      
│           └───src
│               │   database.ts       #Database overhead
│               │   rulesetDb.ts      #Ruleset DB defs
│               │   server.ts         #Server API request handler
│               │
│               └───card-game         #Serverside helper classes/functions
│               │
│               └───rooms             #Public game room data
│               │
│               └───schemas           #Serverside schemas
│
└───test                              #Project tests
```


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
