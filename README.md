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

## Spreadsheets
*To be added*

## EPGP Import
*To be added*

