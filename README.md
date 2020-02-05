# GoodBot

## Getting Started
* Invite GoodBot to your server using the following link: [Invite Link](https://discordapp.com/oauth2/authorize?client_id=525115228686516244&permissions=8&scope=bot)
* Use the +setup command -- this will do the following:
  * Create a 'Getting Started' category
  * Create a 'set-your-name' channel, where users can set their in-game nickname.
  * Create a 'set-your-class' channel, where users can set the class the bot will use for their sign-ups.
  * Create a 'set-your-role' channel, where users can set the role the bot will use for their sign-ups.
* Set your raid category: +setoption raidcategory Raid Signups // You can change this to be any category, but please be aware it is case sensitive.
* Set your spreadsheet ID: +setoption sheet GoogleSheetID // This is covered further in the "Spreadsheet" section.
* Create a channel called 'server-logs' -- the bot will automatically all commands & sign-ups to this channel.

## General Commands
```
+archive
  Move the channel to the 'Archives' category, and syncs the permissions with the category

+clean X
  Delete the previous X messages in chat (Note: this does not work on mesages older than 20 days)

+nick Newname
  Set your discord nickname, validated to be an allowed WoW name

+quote
  Display a random quote

+quote add Your quote goes here
  Add the specified quote

+quote list
  List all quotes

+quote remove ID
  Remove the quote with the specified ID

+setup
  Generate the 'Get Started' channels as outlined above.

+wh
  Attempts to retrieve item information from Wowhead.  (experimental)
```

## Raid Sign-up Commands
```
+confirm Player
  Confirms player for the raid (Confirmation mode must be enabled!)

+exportsheet
  Attempt to export your spreadsheet to Google Sheets  (Will only work if this has been set up, and bot has permissions)
  
+pingalt altName mainName
  Instruct the bot to notify a different player instead of the sign-up name (Useful for alt signups)
  
+pingraid
  Send a notification to all players signed up for the current raid

+raid RaidName Mar-21
  Create a new raid channel under the raid category called RaidName-signups-mar-21

+raiddata confirm 1
  Enable confirmation mode

+raiddata description New description
  Alter the raid description in the embed
  
+raiddata color #hexCode
  Set the color of the sidebar of the embed

+raiddata title New title
  Alter the raid title in the embed

+set Player class role
  Manually set a player's class and role.  Valid roles are DPS, Tank, Healer, Caster.

+unconfirm Player
  Unconfirms player for the raid (Confirmation mode must be enabled!)

+unsigned ?daysAgo ?raidName
  Compare the current lineup to the specified raid, and send a notification to all players not currently signed up.  daysAgo defaults to 7 days, and raidName defaults to the current raid name.
```

## Warcraft Logs Commands
```
+compare raid1id raid2id
  Generate a side by side comparison of two raids for boss kills, time between bosses, and overall time elasped after each boss.

+gear Player ?server ?region
  Retrieve a player's gear from the last attended raid.  Server defaults to Mankrik, region defaults to US.

+logs GuildName
  Display a list of the last 10 raids uploaded to WarcraftLogs for the guild

+rankings Taunt ?role ?server ?region
  Display a player'ss best rankings for the specified role.  Roles is defaulted to DPS, Server is defaulted to Mankrik, and region is defaulted to US.  Other role options are HPS or Tank.

+report raidid
  Retrieve basic information about a Warcraft Logs Report  
```

## EPGP Commands
```
+history Player
  Pull a player's EPGP history as recorded by uploaded EPGP files
  
+standings Class
  Retrieve a list of all players of specified class with current EPGP standings
```

## Raid Signups
* All players need to have a class and role set up to be able to sign up for raids.  Once that's done, the player can use the :thumbsup: :thumbsdown: or :shrug: emojis directly under the sign-up list to sign up for the raid.
* A player's class and role can be manually set using the +set command:
  * `+set Taunt warrior tank`
* A player can sign up an alt, or another player by using +, - or m, followed by the player's name
```  
  + Tagalong
  m Tagalong
  - Tagalong
```

## Spreadsheets
*To be added*

## EPGP Import
*To be added*

