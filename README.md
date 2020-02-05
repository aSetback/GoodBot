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

## Common Commands
* +clean X
  *deletes the previous X messages in chat.  This does not work on mesages older than 20 days.*
* +raid RaidName Mar-21
  *creates a new raid channel under the raid category called RaidName-signups-mar-21*
* +quote
  This command has several sub-commands:
  * +quote
    *displays a random quote*
  * +quote add Quote Goes Here
    *adds the specified quote*
  * +quote list
    *lists all queotes*
  * +quote remove ID
    *removes the quote with the specified ID*
* +archive
  *moves the channel to the 'Archives' category, and syncs the permissions with the category*

## Warcraft Logs Commands
* +logs GuildName
  *This will display a list of the last 10 raids uploaded to WarcraftLogs for the guild*
* +rankings Taunt ?role ?server ?region
  *This will display the players best rankings for the specified role.  Roles is defaulted to DPS, Server is defaulted to Mankrik, and region is defaulted to US.  Other role options are HPS or Tank.
* +compare raid1id raid2id
  *This will do a side by side comparison of two raids for boss kills, time between bosses, and overall time elasped after each boss.

## Raid Signups
* All players need to have a class and role set up to be able to sign up for raids.  Once that's done, the player can use the :thumbsup: :thumbsdown: or :shrug: emojis directly under the sign-up list to sign up for the raid.
* A player's class and role can be manually set using the +set command:
  +set Taunt warrior tank
* A player can sign up an alt, or another player by using +, - or m, followed by the player's name
 + Tagalong
 m Tagalong
 - Tagalong

## Spreadsheets
*To be added*

## EPGP Import
*To be added*

