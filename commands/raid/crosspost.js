exports.run = async (client, message, args) => {

    let raid = await client.raid.get(client, message.channel);
    if (!raid) {
        client.messages.errorMessage(message.channel, client.loc('dupeNoRaid', "This is not a valid raid channel, could not duplicated."), 240);
    }
    let serverID = args[0];

    let category = client.customOptions.get(serverID, 'raidcategory');
	if (!category) {
		category = 'Raid Signups';
    }

    factionRequired = client.raid.factionRequired(client, serverID);
	if (factionRequired && !raid.faction) {
		return message.channel.send('You need to specify which faction this raid is for.\n usage: `+raid bwl mar-21 tagalong horde`');
	}

    // Check for overwrite for this raid type
	let categoryParams = {'raid': raid.raid, 'guildID': serverID};
	if (factionRequired) {
		categoryParams.faction = raid.faction;
    }
    
    let crosspostGuild = client.guilds.find(g => g.id == serverID);
	
	client.models.raidCategory.findOne({ where: categoryParams}).then((raidCategory) => {
		if (raidCategory) {
			category = raidCategory.category; 
		}

		// Retrieve our category from the discord API
		let discordCategory = crosspostGuild.channels.find(c => c.name.toLowerCase() == category.toLowerCase().trim() && c.type == "category");

		if (!discordCategory) {
			return message.channel.send('Channel category "' + category + '" does not exist.  Make sure to check your capitalization, as these are case sensitive.');
        }
        
		// Retrieve this user's permission for the raid category
		let permissions = discordCategory.permissionsFor(message.author);
		if (!permissions.has("MANAGE_CHANNELS")) {
			return message.channel.send('You do not have the manage channels permission for "' + category + '".  Unable to complete command.');
		}

        message.guild = crosspostGuild;
        raid.dateString = new Date(raid.date).toLocaleString('default', { month: 'short' }) + '-' + raid.date.split('-')[2];
        client.raid.createRaidChannel(client, message, discordCategory, raid);
        
    });


}