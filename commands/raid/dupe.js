exports.run = async (client, message, args) => {

	let raid = await client.raid.get(client, message.channel);
    if (!raid) {
        client.messages.errorMessage(message.channel, client.loc('dupeNoRaid', "This is not a valid raid channel, could not duplicated."), 240);
    }

	let daysOut = parseInt(args.shift());
	if (!daysOut) {
		daysOut = 7;
	}

	// Retrieve our category
	let category = await client.customOptions.get(client, message.guild, 'raidcategory');
	if (!category) {
		category = 'Raid Signups';
	}

	// Check for overwrite for this raid type
	let categoryParams = {'raid': raid.raid, 'guildID': message.guild.id};
	if (raid.faction) {
		categoryParams.faction = raid.faction;
	}
    
    let raidDate = new Date(raid.date);
	raidDate.setDate(raidDate.getDate() + daysOut);
    raid.dateString = raidDate.toLocaleString('en-us', { month: 'short', timeZone: 'UTC' }) + "-" + raidDate.getUTCDate();
	client.models.raidCategory.findOne({ where: categoryParams}).then(async (raidCategory) => {
		if (raidCategory) {
			category = raidCategory.category; 
		}

		// Retrieve our category from the discord API
		let discordCategory = message.guild.channels.cache.find(c => c.name == category.trim() && c.type == "GUILD_CATEGORY");

		if (!discordCategory) {
			return message.channel.send('Channel category "' + category + '" does not exist.  Make sure to check your capitalization, as these are case sensitive.');
		}

		// Retrieve this user's permission for the raid category
		let permissions = discordCategory.permissionsFor(message.author);
		if (!permissions.has("MANAGE_CHANNELS")) {
			return message.channel.send('You do not have the manage channels permission for "' + category + '".  Unable to complete command.');
		}
		delete raid.dataValues.id;

        let dupeChannel = await client.raid.createRaidChannel(client, message, discordCategory, raid);
        if (raid.rules) {
            await client.models.raidRules.findOne({where: {name: raid.rules, guildID: message.guild.id}}).then(async (raidRules) => {
                if (raidRules) {
                    await dupeChannel.send(raidRules.rules);
				} 
            });
		}
		args = [message.channel.name];
		message = {
			channel: dupeChannel,
			guild: message.guild,
			member: message.member
		};
		const cmd = client.commands.get('unsigned');
		cmd.run(client, message, args);

	});
}