# User Manual
This guide will help you get started and set up Card Infinity on Discord. 

## How to Install 

- Card Infinity runs in Discord, so make sure you have Discord installed and set up on your device.
- Discord can be found in the App Store or Google Store for mobile devices, and here is a guide to installing Discord on desktop, [Desktop-Installation-Guide](https://support.discord.com/hc/en-us/articles/360034561191-Desktop-Installation-Guide) 
- Make sure you make a Discord account and also enable 2FA. Here is a guide for that, 2FA https://support.discord.com/hc/en-us/articles/219576828-Setting-up-Multi-Factor-Authentication 
- You can now enter a chat or a server and launch Card Infinity from the Activities center. 


### Fresh Setup/Installation

#### DISCLAIMER

This is for setting up a personal instance of the application. If you want to use ours, use this installation link: https://discord.com/oauth2/authorize?client_id=1471216962213511294
Please be aware that our current hosting service is EXTREMELY temporary and that this link will not be working most of the time for now. If you want to run the app on your own time, we'd recommend setting up a personal instance. 

#### PREREQUISITES
A current version of npm and pnpm must be installed, 
Instructions for setting up npm can be found here: https://www.ramotion.com/blog/how-to-install-npm/
Instructions for setting up pnpm: https://pnpm.io/cli/setup 

1) Clone repository  
2) Navigate into the phaser-multiplayer-template directory   
3) Run npm install  
4) Run npm run dev  

#### IF RUNNING THROUGH LOCALHOST 
***(easier, but with limited capabilities. Recommended for testing)***  
1) Go to http://localhost:3000/, you can access a singleplayer game through here.
   * Note that this can currently only handle singleplayer connections
   ** This is the only step. lol.  

#### IF RUNNING AS A DISCORD ACTIVITY
You will need to set up an activity through the Discord developer portal.
You can create a new application here: https://discord.com/developers/applications/ 
To access this page, you will need to have a Discord account with 2FA enabled. 
Instructions for setting up 2FA in Discord can be found here: https://support.discord.com/hc/en-us/articles/219576828-Setting-up-Multi-Factor-Authentication

1) In the Discord dev portal applications screen, create a new Discord activity through the "New Activity" button at the top right of the screen.  
2) Go to the OAuth2 tab under the Settings section of your activity through the Discord developer portal and add https://127.0.0.1 as a new redirect under Redirects.  
3) Open example.env and put the client id and client secret keys from your OAuth2 page into the values for VITE_CLIENT_ID and CLIENT_SECRET respectively with no quotes (You may need to reset the client secret on the app in order to do this. Rename example.env to .env and ensure the NODE_ENV value is set to 'production' (including quotes).  
   *Whenever you reset this secret, make sure to update it here as well or the app will not work afterwards.  
4) Within CardInfinity403/phaser-multiplayer-template/ run 'npm run dev' to build the client. Then 'cd ./packages/server/' and make sure the server is running in production mode with 'npm run start:prod'. Client and server should both be listening on localhost:3000. Open a new terminal window in the phaser-multiplayer-template directory and run 'npm run tunnel'.  
5) Copy the generated cloudflared link, go to the Discord developer portal for your activity, and navigate to the URL Mappings tab under the Activities section. Paste the link here.  
   *Every time you run 'cloudflared tunnel --url http://localhost:3000' you will need to update this mapping due to cloudflared only providing temporary hosting services. This is annoying and something we are working on fixing, but we have not found a better solution yet.
6) Scroll down to the Settings tab under the Activities section (As opposed to the Settings section higher up) and make sure that "Enable Activities" is set to true. This setting will not be able to be changed if no URL mapping has been set.   
7) Scroll to the Installation tab under the Settings section and open the installation link. It should prompt you to open Discord through the non-developer interface and ask you to add the activity. You can either add it to a specific server or to your apps; choosing a specific server means that anyone in that server can use this activity in that server, while adding it to your apps allows you to start the app in any server or dm.  
8) If you added it to a server, navigate to a text or voice channel within that server, open the Activities menu, and you should be able to launch the activity from there.  
9) If you added it to your apps, navigate to any Discord chat or call and open the Activities menu. You should be able to launch the activity through here.  



### Quick Start (using our link) 
#### [IN THEORY. In the actual, full, proper release of our app, this would be the only setup instruction in this category; due to the way that our app is currently hosted this is not a good way to set up the application]

1) Click on the link to install https://discord.com/oauth2/authorize?client_id=1471216962213511294 
2) Select the server where you want to add Card Infinity, or choose "Add to Apps" to use it anywhere.
3) To launch the game on a server, go to any text or voice channel, click the Activities button in the chat bar, and select Card Infinity from the list.
4) To launch on a chat or group chat, open the chat, click the Activities button, and select Card Infinity from the list.
5) Once a host starts the game (aka you), other people in the channel can join your game by clicking “join,” and now you can all play together. 

## Using the Software 

When you first launch Card Infinity, you will see the main screen with three options:
1) Start Game - Creates a new game lobby with your selected ruleset.
2) Manage Rules - Opens the ruleset editor, where you can create, modify, or set rulesets for gameplay.
3) Join Game - Allows you to enter an existing game that someone else is hosting via room code.

Playing the Game 
Currently, the default game is a customized version of Uno. You will see a table with cards and your hand of cards. If you can, you play a card, if you can't, you click “draw” to draw a card and then click “end turn”. You must click “end turn” after any action to pass the turn to the next player. 


## Bug Reporting
If you find a bug, we'd love to hear about it! 
  
### Where to report 
- Please create an issue on our issue tracker here: https://github.com/eleanorlynch/CardInfinity403/issues 
- **PLEASE CHECK THE TRACKER TO SEE IF THE ISSUE IS ALREADY PRESENT BEFORE REPORTING**
- **PLEASE CHECK KNOWN BUGS BELOW BEFORE REPORTING**
  
### What to include 
1) Clear summary of the issue
2) Steps you took before you ran into the bug
2.5) Steps you took to reproduce the bug (VERY HELPFUL)
3) What you expected to happen
4) What actually happened
5) (optional) Include your setup and any screenshots (if possible) to help our team better understand the issue. **The more detail provided, the better!**


### Known Bugs/Limitations
- Button Interactions - The engine we're using is, unfortunately, really horrible with tap targets. Changing resolution will change the interactive spots for buttons in unexpected ways. 
- npm tunnel not working - Sometimes you just need to turn it off and on again, we have no idea why this doesn't always work. If you're having issues with the cloudflared page not showing your game, try re-running the application and the tunnel.

## Frequently Asked Questions  
- Q: Do I need to install anything other than Discord?
- A: Generally? Nope! Card Infinity runs entirely inside Discord. Just click the installation link, and you're good to go. If you'd like to use a local copy, however, see the above installation instructions.
- Q: Can I play on mobile?
- A: Possibly, but please keep in mind that only desktop play is currently officially supported. Mobile may work, but we make no guarantees. 
- Q: How do I create my own rules? How do I select a ruleset to play?
- A: Click "Manage Rules" from the main menu. You can set a ruleset to be used from here, add new rulesets, or edit existing ones.
