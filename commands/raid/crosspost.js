exports.run = async (client, message, args) => {

    let raid = await client.raid.get(client, message.channel);
    if (!raid) {
        return client.messages.errorMessage(message.channel, client.loc('dupeNoRaid', "This is not a valid raid channel, could not duplicated."), 240);
	}
	
	// Retrieve our server ID or name
	let server = args.join(' ');
	if (!server) {
		return client.message.errorMessage(message.channel, client.loc('noServerID', "Please provide a valid server ID or name."), 240);
	}

	let crosspostGuild = client.guilds.find(g => g.id == server || g.name.toLowerCase() == server.toLowerCase());

	// Retrieve the category
    let category = await client.customOptions.get(client, crosspostGuild.id, 'raidcategory');
	if (!category) {
		category = 'Raid Signups';
    }

	// Retrieve the whether or not the faction is required on the specified server.
	factionRequired = client.raid.factionRequired(client, crosspostGuild.id);
	if (factionRequired && !raid.faction) {
		return message.channel.send('You need to specify which faction this raid is for.\n usage: `+raid bwl mar-21 tagalong horde`');
	}

    // Check for overwrite for this raid type
	let categoryParams = {'raid': raid.raid, 'guildID': crosspostGuild.id};
	if (factionRequired) {
		categoryParams.faction = raid.faction;
    }
	
	let raidCategory = await client.models.raidCategory.findOne({ where: categoryParams});
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

	let raidDate = new Date(raid.date);
	raid.dateString = raidDate.toLocaleString('en-us', { month: 'short', timeZone: 'UTC' }) + "-" + raidDate.getUTCDate();
	client.raid.createRaidChannel(client, message, discordCategory, raid, crosspostGuild);

}