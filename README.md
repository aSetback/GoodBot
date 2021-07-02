# GoodBot

## Need Help?
* Join the GoodBot Discord and ask for help in the #Support channel: [GoodBot Discord](http://goodbot.mankrikpugs.com/)

## Getting Started
* Invite GoodBot to your server using the following link: [Invite Link](https://discordapp.com/oauth2/authorize?client_id=525115228686516244&permissions=8&scope=bot)

### Setup Class & Role Channels
* Use the +setup command -- this will do the following:
  * Create a 'Getting Started' category
  * Create a 'set-your-name' channel, where users can set their in-game nickname.
  * Create a 'set-your-class' channel, where users can set the class the bot will use for their sign-ups.
  * Create a 'set-your-role' channel, where users can set the role the bot will use for their sign-ups.
  * Create a 'Raid Signups' category, where your new raid channels will be created.

### Optional Setup
* +setupfaction
  * This will add an additional set-up channel for 'set-your-faction' -- use this only if your discord is both horde & alliance.
* +setoption completerole <Setup>
  * This will direct the bot to add a role to players who have completed the set-up channels -- replace <Setup> with the role you'd like the bot to give.
* Set your spreadsheet ID: +setoption sheet <GoogleSheetID>
  * This is covered further in the "Spreadsheet" section.

### Gear Check / Logs Setup
* Set your guild's server: +setoption server <Server Name>
* Set your guild's region: +setoption server <Region> // (US or EU)

### Command/Error Logging
* If you create a channel called 'server-logs', the bot will automatically log all commands & sign-ups to this channel.
* If you create a channel called 'error-logs', the bot will automatically log all command/signup errors to this channel.

## General Commands
```
+archive
  Move the channel to the 'Archives' category, and syncs the permissions with the category

+clean X
  Delete the previous X messages in chat (Note: this does not work on mesages older than 14 days)

+removeallpins
  Unpin all current pins in the current channel.

+serverid
  The bot will DM you the server's ID

+setup
  Generate the 'Getting Started' channels & 'Raid Signups' Category.

+setupfaction
  Generate a channel under 'Getting Started' for choosing faction

+joinmessage <message>
  Sets a message that will be sent to all new players when they join your discord server.

+archiveold
  Clones the current 'Archives' category (complete with all permissions), then renames the current 'Archives' to 'Archives-Old'

+deletecategory <Category Name>
  Deletes a channel category and all sub-channels.  **BE VERY CAREFUL WITH THIS, THERE IS NO UNDO BUTTON**

```

## Character Management Commands
```
+set <Player> <class> <role>
  Manually set a player's class and role.  Valid roles are DPS, Tank, Healer, Caster.

+alt <altName> <mainName>
  Set a character as an alt of your main character.

+info <character>
  Returns the main and all alts attached to this character, along with signed up raid and resistances.

+resist <character> <type> <amount>
  Set a player's resistance of a type (fire, frost, shadow, nature) to a number for export on spreadsheet.

+resistlist
  Outputs the resistances for all players signed up for a raid.

+reservehistory <character>
  Returns a complete history of all items this player has reserved.
```

## Raid Sign-up Commands
```
 +raid <RaidName> <Date> <Title?> <Faction?>
  Create a new raid channel under the raid category called mar-21-RaidName

+dupe <days?>
  Creates a duplicate raid <days> days later, and pings all players who were signed up for the previous raid.  Default days is 7.

+crosspost <Discord Server Name>
  Crossposts the raid to a second discord server so that players can sign up in both locations.
  Caveats:
    * The user using the command needs to have 'Manage Channels' permissions in both servers to be able to crosspost.
    * A raid can only be crossposted once.  If it is crossposted a second time, the first crosspost will cease to work.

+lineup
  The bot will DM you a link to the page for managing your raid lineup.
  
+lock
  Locks a raid, preventing all further signups & reserves.

+unlock
  Unlocks a raid, allowing additional signups & reserves.

+exportsheet <SheetID?>
  Attempt to export your spreadsheet to Google Sheets  (Will only work if this has been set up, and bot has permissions)
  This will ping only confirmed players if confirmation mode is enabled.
  
+setcolor <#HexCode>
  Set the color of the sidebar of the embed

+setdate <Valid Date>
  Sets the date of the raid, in 

+setdescription <New Raid Description>
  Alter the raid description in the embed

+setleader <@Leader>
  Sets the raid leader of the raid

+addleader <@Leader>
  Adds an additional leader to the raid sign-up

+removeleader <@Leader>
  Removes an additional leader from the raid sign-up (there must always be one!)

+settime <Valid Time>
  Set the time for the raid start

+settitle <New Raid Title>
  Alter the raid title in the embed

+remove <Player>, <Player>, ...
  Removes player(s) from sign-ups completely.

+resistlist
  Sends a DM to the player with the resistances of all signed up players

```

## Confirmations
```
+confirmation
  Toggle 'confirmation mode' for a raid.

+confirm <Player>, <Player>, ...
  Confirms player for the raid (Confirmation mode must be enabled!)

+unconfirm <Player>, <Player>, ...
  Unconfirms player for the raid (Confirmation mode must be enabled!)

+copyconfirmation <#Previous Raid Channel>
  Copies the confirmed players from the previous raid to the current one.
```


## Rules
```
+rules add <Rules Name> <Rules Go Here>
  Add a rule to be displayed later with a name of <Rules Name>.

+rules <Rules Name>
  Have the bot display rules with the name of <Rules Name>.

+setrules <Rules Name>
  Set raid rules that will display when the raid is duped.

```

## Pings
```
+ping raid
  Pings every signed up for this raid.

+ping confirmed
  Pings all players who are confirmed for this raid.

+ping class <Class>
  Pings all signed up players of that class that are signed up for the raid.

+ping role <Role>
  Pings all signed up players of that role that are signed up for the raid.

+unsigned <#Previous Raid Channel>
  Compare the current lineup to the specified raid, and send a notification to all players not currently signed up.

+noreserve
  Pings all players who do not currently have a reserve.

```

## Soft Reserves
```
  +softreserve
    Toggle a raid to have soft reserve as the loot system (reservable items are keyed off of the selected raid type)

  +reserve <Character Name?> <Item Name>
    Save a reserve for the specificed item for the specified character name.  Include character name if your discord name doesn't match the name you signed up with.

  +reservelist
    The bot will DM the user a list of all reserves that have been made for this raid, ordered by item name

  +reservelist channel
    The bot will list all reserves that have been made for this raid in the channel

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
+item <Item>
  Does a fuzzy search for the item string and returns the top result as an embed.

+price <Item>
  Does a fuzzy search for the item string and returns AH price information for it as an embed.
```

## Wav Files
```
+wav <Wav Name>
  Plays a specified wav in the channel you're in.

+wavlist
  DMs a list of all wav files to the user.
```

## Warcraft Logs Commands
```
+compare <Raid ID> <Raid ID>
  Generate a side by side comparison of two raids for boss kills, time between bosses, and overall time elasped after each boss.

+gear <Player
  Retrieve a player's gear from the last attended raid.  Server defaults to Mankrik, region defaults to US.

+enchants <Player>
  Lists all enchantable gear a player was wearing during the last raid, and which pieces are enchanted with what.

+logs <Guild Name>
  Display a list of the last 10 raids uploaded to WarcraftLogs for the guild

+rankings <Player> <Role?>
  Display a player's best rankings for the specified role.  Roles is defaulted to DPS, Server is defaulted to Mankrik, and region is defaulted to US.  Other role options are HPS or Tank.

+report <Raid ID>
  Retrieve basic information about a Warcraft Logs Report  
```

## Raid Signups
* All players need to have a class and role set up to be able to sign up for raids.  Once that's done, the player can use the 'Yes', 'No' or 'Maybe' buttons directly under the sign-up list to sign up for the raid.
* A player's class and role can be manually set using the +set command.
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

An example sheet can be found here: https://docs.google.com/spreadsheets/d/1KJz86pYn7rHx1Aru9Uc2xcTwl-QZrxJb8_4BRRkapZs

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
monk dps => 20
monk tank => 21
monk healer => 22
dh dps => 23
dh tank => 24
```
To set up your spreadsheet:
* The sheet must be shared with **discord@api-project-483394155093.iam.gserviceaccount.com**
* Set your server's sheet ID using: +setoption sheet SheetID 
  * In the example above, sheetID would be 1mH9UD5luAV3YiSy4OCuzw1Lbd5xe0eF4VCYp013h7eo
* Export your sheet using `+exportsheet` within a raid channel.