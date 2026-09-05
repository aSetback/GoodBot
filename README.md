# GoodBot

## Need Help?
* Join the GoodBot Discord and ask for help in the #Support channel: [GoodBot Discord](http://goodbot.mankrikpugs.com/)

## Getting Started
* Invite GoodBot to your server using the following link: [Invite Link](https://discordapp.com/oauth2/authorize?client_id=525115228686516244&permissions=8&scope=bot)

### Initial Setup
* Use the `/setup` command -- this will do the following:
  * Create a 'Raid Signups' category, where your new raid channels will be created.
  * Create an 'Archives' category, where archived raid channels are moved.
  * Create a 'Get Started' category with a 'Get-Started-GoodBot' channel, where users click a button to set up their main or alt character (name, class, and role).
* If your server has both factions raiding, run `/setupfaction` (after `/setup`) to create a 'select-your-faction' channel where users can pick Alliance or Horde.

### Options
* Using the `/setoption` command, you can set the following server-wide options:
  * Faction
  * WoW Server
  * Multi Faction Server
  * Enable Class Roles
  * Complete Role
  * Google Sheet ID
  * Warcraft Logs API Key
  * Expansion
  * Default Raid Category
  * Welcome Message
* Use `/showoptions` to see the current value of every option above.

### Gear Check / Logs Setup
* Set your guild's server: `/setoption server <Server Name>`

### Command/Error Logging
* If you create a channel called 'server-logs', the bot will automatically log all commands & sign-ups to this channel.
* If you create a channel called 'error-logs', the bot will automatically log all command/signup errors to this channel.

## Utility Commands
```
/setup
  Create the 'Raid Signups', 'Archives', and 'Get Started' categories, along with the character setup channel.
  Requires the Manage Channels permission.

/setupfaction
  Create the 'select-your-faction' channel with Alliance/Horde role buttons. Requires /setup to have been run first.
  Requires the Manage Channels permission.

/setoption <name> <value>
  Set a server-wide option (see the list above). Admin only.

/showoptions
  Display the current value of every server-wide option. Admin only.

/raidcategory <type> <category> [faction]
  Overrides which channel category a specific raid type (eg BWL, MC) is created under, instead of the default raid category.
  Faction is required on multi-faction servers. Admin only.

/archive
  Move the current raid channel to the 'Archives' category and sync its permissions with that category.
  Requires the Manage Channels permission on the channel.

/archiveold
  Rename the existing 'Archives' category to 'Archives-Old' and create a fresh, empty 'Archives' category.
  Requires the Manage Channels permission on the channel.

/deletecategory <category>
  Delete a channel category and every channel inside it. **BE VERY CAREFUL WITH THIS, THERE IS NO UNDO BUTTON.** Admin only.

/clean <number>
  Delete the previous <number> messages in the channel (Note: this does not work on messages older than 14 days).
  Requires the Manage Channels permission on the channel.
```

## Character Management Commands
```
/alt
  Open a modal to link an alt character to one of your existing characters (asks for alt name and main name).

/link <character>
  Clear the character's link to a main character, if one is set.

/unlink <character>
  Clear the character's link to a main character, if one is set.

/set <character>
  Prompts you to pick a class and role for the character from dropdown menus.

/pingid
  Open a modal to set a custom "ping ID" name for a character, used when generating player pings.
  Requires the Manage Channels permission.

/info <character>
  DM-style reply listing the character's main/alts (with class & role) and a history of their raid sign-ups, confirmation status, and soft reserves.

/characterlist
  List every character registered on this server (mains with their alts indented beneath them), sorted alphabetically.

/signup <character> [signup]
  Sign a character up for the raid in the current channel. `signup` accepts Yes, Maybe, or No (defaults to Yes).

/remove <character>
  Completely remove a character from the current raid's sign-ups.
  Requires the Manage Channels permission on the channel.
```

## Raid Sign-up Commands
```
/raid
  Open a modal to create a new raid channel (name, date, instance, and faction if required).

/dupe [days]
  Create a duplicate of the current raid <days> days later (default 7), and ping everyone who was signed up for the original raid but hasn't signed up for the new one.

/crosspost <server>
  Post a copy of the current raid to another Discord server that GoodBot is also in, matching that server's raid category settings.
  Requires the Manage Channels permission on the target server's raid category.

/lineup
  DM the user a link to the web-based lineup management page for the current raid.

/exportsheet
  Export the current raid's lineup, soft reserves, and resistances to the server's configured Google Sheet.
  Requires the Manage Channels permission on the channel, and a Google Sheet ID set via /setoption.

/unsigned <channel>
  Compare the current raid's lineup to the specified previous raid and ping everyone signed up for the previous raid who hasn't signed up for this one.
  Requires the Manage Channels permission on the channel.

/invitemacro
  DM the user a WoW /run macro that invites every confirmed player in the current raid.
```

## Raid Details Commands
```
/raidname <name>
  Set the name shown in the raid embed.
  Requires the Manage Channels permission on the channel.

/raiddate <date>
  Set the raid's date, in the format "Mar-15".
  Requires the Manage Channels permission on the channel.

/raidtime <time>
  Set the raid's start time.
  Requires the Manage Channels permission on the channel.

/raidtitle <title>
  Set the title shown in the raid embed.
  Requires the Manage Channels permission on the channel.

/raiddescription <description>
  Set the description shown in the raid embed.
  Requires the Manage Channels permission on the channel.

/raidtype <type>
  Set the raid instance type (eg BWL, MC).
  Requires the Manage Channels permission on the channel.

/raidleader <@leader>
  Set the raid leader shown in the raid embed.
  Requires the Manage Channels permission on the channel.

/raidhash <hash>
  Link your goodbot.me account hash to your Discord account so soft reserve links appear on your raids.
  Requires the Manage Channels permission on the channel.
```

## Confirmations
```
/confirmation
  Toggle 'confirmation mode' for the current raid.

/confirm <character>
  Confirm one character, a comma-separated list of characters, or "All" for the current raid (Confirmation mode must be enabled).
  Requires the Manage Channels permission on the channel.

/unconfirm <character>
  Unconfirm one character, a comma-separated list of characters, or "All" for the current raid (Confirmation mode must be enabled).
  Requires the Manage Channels permission on the channel.

/copyconfirmation [channel]
  Copy the confirmed players from another raid channel into the current raid.
  Requires the Manage Channels permission on the channel.
```

## Rules
```
/addrules
  Open a modal to create or update a named rule set.

/setrules <rules>
  Attach a named rule set to the current raid, so it's shown automatically when the raid is duped.
  Requires the Manage Channels permission on the channel.

/showrules <rules>
  Post a named rule set to the current channel.
```

## Pings
```
/ping <type> [channel]
  Ping a group of raiders in the current raid channel. `type` accepts:
    raid      - everyone signed up as Yes
    confirmed - everyone confirmed
    unsigned  - everyone signed up on the raid channel given in `channel` but not on the current one
  Requires the Manage Channels permission on the channel.
```

## Soft Reserves
```
/softreserve
  Toggle soft reserve as the loot system for the current raid (reservable items are keyed off the raid type).
  Requires the Manage Channels permission on the channel.

/reserve <item> [character]
  Reserve an item for the specified character in the current raid. Character defaults to your Discord nickname/username if omitted.

/reservelist [type]
  List all reserves made for the current raid, sorted by item name. DMs the list by default; pass "channel" to post it in the channel instead, or "history" to include each player's reserve count for that item.

/reserveitems
  DM the user a list of all items eligible for reserve in the current raid.

/reservelimit <limit>
  Set the maximum number of reserves allowed per player for the current raid. Lowering the limit below the current one clears all existing reserves for the raid.
  Requires the Manage Channels permission on the channel.

/reservelog
  Show a log of every reserve made for the current raid, including who made it and when.

/noreserve
  Ping every confirmed player in the current raid who has not yet set a soft reserve.
  Requires the Manage Channels permission on the channel.

/loaditems <type>
  Load the soft-reservable item list for a raid type from `items/<type>-items.json`. Admin only.

/clearitems <type>
  Delete all soft-reservable items for a raid type. Admin only.
```

## Wav Files
```
/wav <name>
  Join your current voice channel and play the specified wav file.

/wavlist
  DM the user a list of all available wav files.
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
5  => rogue tank 
6  => mage caster 
7  => mage healer 
8  => warlock caster 
9  => warlock tank 
10 => priest healer 
11 => paladin healer 
12 => druid healer 
13 => druid caster 
14 => druid dps 
15 => priest caster 
16 => paladin dps 
17 => paladin tank 
18 => shaman dps 
19 => shaman caster 
20 => shaman healer 
21 => dk dps 
22 => dk tank 
```
To set up your spreadsheet:
* The sheet must be shared with **discord@api-project-483394155093.iam.gserviceaccount.com**
* Set your server's sheet ID using: `/setoption sheet SheetID`
  * In the example above, sheetID would be 1mH9UD5luAV3YiSy4OCuzw1Lbd5xe0eF4VCYp013h7eo
* Export your sheet using `/exportsheet` within a raid channel.
