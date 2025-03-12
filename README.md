# GoodBot

## Need Help?
* Join the GoodBot Discord and ask for help in the #Support channel: [GoodBot Discord](http://goodbot.mankrikpugs.com/)

## Getting Started
* Invite GoodBot to your server using the following link: [Invite Link](https://discordapp.com/oauth2/authorize?client_id=525115228686516244&permissions=8&scope=bot)

### Setup Class & Role Channels
* Use the /setup command -- this will do the following:
  * Create a 'Getting Started' category
  * Create a 'set-your-name' channel, where users can set their in-game nickname.
  * Create a 'set-your-class' channel, where users can set the class the bot will use for their sign-ups.
  * Create a 'set-your-role' channel, where users can set the role the bot will use for their sign-ups.
  * Create a 'Raid Signups' category, where your new raid channels will be created.

### Options
* Using the /options command, you can set the following options:
  * Faction
  * WoW Server
  * Multi Faction Server
  * Complete Role
  * Google Sheet ID
  * Warcraft Logs API Key
  * Expansion
  * Default Raid Category

### Gear Check / Logs Setup
* Set your guild's server: /setoption server <Server Name>

### Command/Error Logging
* If you create a channel called 'server-logs', the bot will automatically log all commands & sign-ups to this channel.
* If you create a channel called 'error-logs', the bot will automatically log all command/signup errors to this channel.

## General Commands
```
/archive
  Move the channel to the 'Archives' category, and syncs the permissions with the category

/clean X
  Delete the previous X messages in chat (Note: this does not work on mesages older than 14 days)

/setup
  Generate the 'Getting Started' channels & 'Raid Signups' Category.

/deletecategory <Category Name>
  Deletes a channel category and all sub-channels.  **BE VERY CAREFUL WITH THIS, THERE IS NO UNDO BUTTON**

```

## Character Management Commands
```
/set Player
  Manually set a player's class and role.  Valid roles are DPS, Tank, Healer, Caster.

/alt Player
  Set a character as an alt of your main character.

/info Player
  Returns the main and all alts attached to this character, along with signed up raid and resistances.

/remove Player
  Completely remove a player from the current signup

/signup Player
  Add a player to the current signup
```

## Raid Sign-up Commands
```
/raid
  Create a new raid channel under the raid category called mar-21-RaidName

/dupe Days
  Creates a duplicate raid <days> days later, and pings all players who were signed up for the previous raid.  Default days is 7.

/lineup
  The bot will DM you a link to the page for managing your raid lineup.
  
/lock
  Locks a raid, preventing all further signups & reserves.

/unlock
  Unlocks a raid, allowing additional signups & reserves.

/exportsheet
  Attempt to export your spreadsheet to Google Sheets  (Will only work if this has been set up, and bot has permissions)
  This will ping only confirmed players if confirmation mode is enabled.
  
/raiddate <Valid Date>
  Sets the date of the raid, needs to be in the format "Mar-15"

/raiddescription <New Raid Description>
  Alter the raid description in the embed

/raidleader <@Leader>
  Sets the raid leader of the raid, use the player tag within the commmand

/raidtime <Valid Time>
  Set the time for the raid start

/raidtitle <New Raid Title>
  Alter the raid title in the embed

```

## Confirmations
```
/confirmation
  Toggle 'confirmation mode' for a raid.

/confirm all
  Confirms all players for the current raid

/unconfirm all
  Unconfirms all players for the current raid

/confirm <Player>, <Player>, ...
  Confirms player for the raid (Confirmation mode must be enabled!)

/unconfirm <Player>, <Player>, ...
  Unconfirms player for the raid (Confirmation mode must be enabled!)

/copyconfirmation <#Previous Raid Channel>
  Copies the confirmed players from the previous raid to the current one.
```


## Rules
```
/addrules
  Open a modal to add rules to be displayed later

/showrules <Rules Name>
  Display a rule set

/setrules <Rules Name>
  Set raid rules that will display when the raid is duped.

```

## Pings
```
/ping raid
  Pings every signed up for this raid.

/ping confirmed
  Pings all players who are confirmed for this raid.

/ping unsigned <#Previous Raid Channel>
  Compare the current lineup to the specified raid, and send a notification to all players not currently signed up.
```

## Soft Reserves
```
  /softreserve
    Toggle a raid to have soft reserve as the loot system (reservable items are keyed off of the selected raid type)

  /reserve
    Set a reserve for the specificed item for the specified character name.  Include character name if your discord name doesn't match the name you signed up with.

  /reservelist
    The bot will DM the user a list of all reserves that have been made for this raid, ordered by item name

  /reservelist channel
    The bot will list all reserves that have been made for this raid in the channel

  /reserveitems
    The bot will DM the user a list of all items that are available for reserve for this raid

```

## Wav Files
```
/wav <Wav Name>
  Plays a specified wav in the channel you're in.

/wavlist
  DMs a list of all wav files to the user.
```

## Spreadsheets
Spreadsheet export can be set up by providing the bot access to a Google Sheet.
An example sheet can be found here: https://docs.google.com/spreadsheets/d/1KJz86pYn7rHx1Aru9Uc2xcTwl-QZrxJb8_4BRRkapZs
All sign-ups are exported to the first page of the spreadsheet, by column.  Export begins on the third row.
```
Columns:
1  => warrior tank 
2  => warrior dps 
3  => hunter dps 
4  => rogue dps 
5  => mage caster 
6  => warlock caster 
7  => priest healer 
8  => paladin healer 
9  => druid healer 
10 => druid caster 
11 => druid dps 
12 => priest caster 
13 => paladin dps 
14 => paladin tank 
15 => shaman dps 
16 => shaman caster 
17 => shaman healer 
18 => dk dps 
19 => dk tank 
20 => monk dps 
21 => monk tank 
22 => monk healer 
23 => dh dps 
24 => dh tank 
25 => evoker dps 
26 => evoker healer
```
To set up your spreadsheet:
* The sheet must be shared with **discord@api-project-483394155093.iam.gserviceaccount.com**
* Set your server's sheet ID using: /setoption sheet SheetID 
  * In the example above, sheetID would be 1mH9UD5luAV3YiSy4OCuzw1Lbd5xe0eF4VCYp013h7eo
* Export your sheet using `/exportsheet` within a raid channel.
