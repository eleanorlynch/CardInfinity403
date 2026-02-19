Status Report Week 6
High level goal: Complete a beta-version to be able to launch CardInfinity on discord and play a basic game.

Original goals for the week: 
1. Set up launchable app on Discord
2. Implement basic card game rules and database schema for ruleset
3. Implement functional UI
4. Implement basic multiplayer connectivity
5. Implement game session creation/handling
6. Create and complete google slide presentation for demo

Progress and issues: 
1. Launchable app set up in Discord that was fully working in single player, still working on getting it working in multiplayer.
2. Implemented a hardcoded ruleset for Uno rules to be able to play that for the demo, still working on database schema for rulesets, need to push this goal to next week.
3. Implemented UI for both main menu screen and game room/table screen in single player and localhost multiplayer. Only small tweak left is to get main menu background loading correctly in tunneled multiplayer.
4. Implemented basic multiplayer connectivity in the browser and were able to play a game against each other in the browser through the tunneled cloudflare link.
5. Implemented game session creation/handling. Main menu "start game" button now creates a game room other plays can join and creates a new room when full.
6. Completed google slides presentation for demo.

Questions for the product owner:
- none at the moment

Goals for next week:
1. Get launchable multiplayer app in Discord working
2. Implement database schema for rulesets
3. Fix multiplayer main menu UI assets not loading/uploading
4. Implement "join room" so players can join a specific game
5. Add tests for client side files
6. Clean up repo/unused files