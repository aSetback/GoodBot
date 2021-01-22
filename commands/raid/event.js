exports.run = async (client, message, args) => {

	// Retrieve our category
	let category = await client.customOptions.get(client, message.guild, 'raidcategory');
	if (!category) {
		category = 'Raid Signups';
	}
	
	let raid = {};
	raid.raid = args.shift().toUpperCase();
	raid.dateString = args.shift();
	raid.name = args.shift();

	if (!raid.name) {
		raid.name = raid.raid;
	}

	// Check for overwrite for this raid type
	let categoryParams = {'raid': raid.raid, 'guildID': message.guild.id};
	
	client.models.raidCategory.findOne({ where: categoryParams}).then((raidCategory) => {
		if (raidCategory) {
			category = raidCategory.category; 
		}

		// Retrieve our category from the discord API
		let discordCategory = message.guild.channels.cache.find(c => c.name.toLowerCase() == category.toLowerCase().trim() && c.type == "category");

		if (!discordCategory) {
			return message.channel.send('Channel category "' + category + '" does not exist.  Make sure to check your capitalization, as these are case sensitive.');
		}

		// Retrieve this user's permission for the raid category
		let permissions = discordCategory.permissionsFor(message.author);
		if (!permissions.has("MANAGE_CHANNELS")) {
			return message.channel.send('You do not have the manage channels permission for "' + category + '".  Unable to complete command.');
		}

		client.raid.createEventChannel(client, message, discordCategory, raid, message.guild);
	});
}