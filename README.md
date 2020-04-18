# GoodBot

## Getting Started
* Invite GoodBot to your server using the following link: [Invite Link](https://discordapp.com/oauth2/authorize?client_id=525115228686516244&permissions=8&scope=bot)

### Set Up Class & Role Channels
* Use the +setup command -- this will do the following:
  * Create a 'Getting Started' category
  * Create a 'set-your-name' channel, where users can set their in-game nickname.
  * Create a 'set-your-class' channel, where users can set the class the bot will use for their sign-ups.
  * Create a 'set-your-role' channel, where users can set the role the bot will use for their sign-ups.
* Optionally use +setupfaction command -- This will add an additional set-up channel for 'set-your-faction'
* Set a completion role: +setoption completerole Setup // (This is optional, but will add this role to players who have completed the set-up channels)

### Set Up Spreadsheet Export
* Set your spreadsheet ID: +setoption sheet GoogleSheetID // This is covered further in the "Spreadsheet" section.

### Set Up Raid Creation
* Set your raid category: +setoption raidcategory Raid Signups // You can change this to be any category, but please be aware it is case sensitive.
* If you would like different raids to go to different categories:
  * +raidcategory raid categoryName
* Verify that the players that need to be able create raids have 'Manage Channels' permission within the Raid Category.

### Warcraft Logs Setup
* Set your guild's server: +setoption server Server Name
* Set your guild's region: +setoption server US // (or EU, etc)

### Misc
* Create a channel called 'server-logs' -- the bot will automatically all commands & sign-ups to this channel.

## General Commands
```
+archive
  Move the channel to the 'Archives' category, and syncs the permissions with the category

+clean X
  Delete the previous X messages in chat (Note: this does not work on mesages older than 14 days)

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

+serverid
  The bot will DM you the server's ID

+setup
  Generate the 'Getting Started' channels as outlined above.

+setupfaction
  Generate a channel under 'Getting Started' for choosing faction

+joinmessage message
  Sets a message that will be sent to all new players when they join your discord server.

```

## Raid Sign-up Commands
```
+alt altName mainName
  Set a character as an alt of your main character (for pinging purposes)
  
+confirmation
  Toggle 'confirmation mode' for a raid

+confirm Player
  Confirms player for the raid (Confirmation mode must be enabled!)

+exportsheet
  Attempt to export your spreadsheet to Google Sheets  (Will only work if this has been set up, and bot has permissions)
  This will ping only confirmed players if confirmation mode is enabled.
  
+pingraid
  Send a notification to all players signed up for the current raid

+ping confirmed
  Send a notification to confirmed players for the current raid

+raid RaidName Mar-21 (title?) (faction?)
  Create a new raid channel under the raid category called mar-21-RaidName

+rules add RulesName Rules go here
  Add a rule to be displayed later with a name of "RulesName"

+rules RulesName
  Have the bot display rules with the name of "RulesName"

+setdescription New description
  Alter the raid description in the embed
  
+settime Time
  Set the time for the raid start

+setcolor #hexCode
  Set the color of the sidebar of the embed

+settitle New title
  Alter the raid title in the embed

+set Player class role
  Manually set a player's class and role.  Valid roles are DPS, Tank, Healer, Caster.

+unconfirm Player
  Unconfirms player for the raid (Confirmation mode must be enabled!)

+unsigned PreviousRaidChannel
  Compare the current lineup to the specified raid, and send a notification to all players not currently signed up.
```

## Soft Reserves
```
  +softreserve
    Toggle a raid to have soft reserve as the loot system (reservable items are keyed off of the selected raid type)

  +reserve CharacterName Full Item Name
    Save a reserve for the specificed item for the specified character name

  +reservelist
    The bot will DM the user a list of all reserves that have been made for this raid, ordered by item name

  +reserveitems
    The bot will DM the user a list of all items that are available for reserve for this raid

```


## Configuration Options
```
  +setoption factionrequired 1
    Require a faction when creating a raid and setting a raid category

  +raidcategory raid (faction?) Category Name
    Set a category for a raid to be set up under (for a specific faction, if factionrequired is enabled)
```

## Nexushub Commands
```
+item Item
  Does a fuzzy search for the item string and returns the top result as an embed.

+price Item
  Does a fuzzy search for the item string and returns AH price information for it as an embed.
```


## Warcraft Logs Commands
```
+compare raid1id raid2id
  Generate a side by side comparison of two raids for boss kills, time between bosses, and overall time elasped after each boss.

+gear Player
  Retrieve a player's gear from the last attended raid.  Server defaults to Mankrik, region defaults to US.

+logs Guild Name // S[aces are alloweds
  Display a list of the last 10 raids uploaded to WarcraftLogs for the guild

+rankings Taunt ?role
  Display a player's best rankings for the specified role.  Roles is defaulted to DPS, Server is defaulted to Mankrik, and region is defaulted to US.  Other role options are HPS or Tank.

+report raidid
  Retrieve basic information about a Warcraft Logs Report  
```

## EPGP Commands
```
+history Player
  Pull a player's EPGP history as recorded by uploaded EPGP files
  
+standings Class
  Retrieve a list of all players of specified class with current EPGP standings

+uploads 
  Lists all EPGP uploads for your server

+uploads Date
  Outputs an EPGP upload as a Lua table
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

## Music Bot
```
+play youtubeURL
  Plays/Queues the song to be played

+skip
  Skips the current track

+stop
  Stops the bot from playing, and clears the queue

+volume 1-200
  Sets the volume to a percentage (1% -> 200%)

+np
  Displays the name of the song currently playing

+queue
  Displays the current queue
```

## Spreadsheets
```
Spreadsheet export can be set up by providing the bot access to a Google Sheet.

An example sheet can be found here: https://docs.google.com/spreadsheets/d/1mH9UD5luAV3YiSy4OCuzw1Lbd5xe0eF4VCYp013h7eo

All sign-ups are exported to the first page of the spreadsheet, by column.  Export begins on the third row.

Columns:
		warrior tank => 1
		warrior dps => 2
		hunter dps => 3
		rogue dps => 4
		mage caster => 5
		warlock caster => 6
		priest healer => 7
		paladin healer => 8
		druid healer => 9
		druid caster => 10
		druid dps => 11
		priest caster => 12
		paladin dps => 13
		paladin tank => 14
		shaman dps => 15
		shaman caster => 16
		shaman healer => 17
		dk dps => 18
		dk tank => 19
```
To set up your spreadsheet:
* The sheet must be shared with discord@api-project-483394155093.iam.gserviceaccount.com																								
* Set your server's sheet ID using: +setoption sheet SheetID // In the example above, sheetID would be 1mH9UD5luAV3YiSy4OCuzw1Lbd5xe0eF4VCYp013h7eo
* Export your sheet using `+exportsheet` within a raid channel.

## EPGP Import
```
The bot is set up to allow players to upload their EPGP standings from GoodEPGP for viewing & usage on their discord server.

GoodEPGP can be found here:
https://www.curseforge.com/wow/addons/goodepgp


```
To set up:
* Create a channel called "Standings".  The bot will automatically display your EPGP standings here when they're updated.

To upload your standings:
* /reload your game, or log out.  (This writes to your savedVariables file)
* Use +serverid to retrieve the ID of your discord server
* Go to http://upload.setback.me/
  * Enter your Server ID
  * Choose your GoodEPGP.lua file from inside your SavedVariables folder
  * Click Upload

