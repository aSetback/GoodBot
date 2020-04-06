exports.run = (client, message, args) => {

	// Retrieve our category
	let category = client.customOptions.get(message.guild, 'raidcategory');
	if (!category) {
		category = 'Raid Signups';
	}

	let raid = args.shift().toUpperCase();
	let raidDate = args.shift();
	let name = args.shift();
	
	if (!name) {
		name = raid;
	}

	// Check for overwrite for this raid type
	let categoryParams = {'raid': raid, 'guildID': message.guild.id};
	client.models.raidCategory.findOne({ where: categoryParams}).then((raidCategory) => {
		if (raidCategory) {
			category = raidCategory.category; 
		}

		// Retrieve our category from the discord API
		let discordCategory = message.guild.channels.find(c => c.name == category.trim() && c.type == "category");

		if (!discordCategory) {
			return message.channel.send('Channel category "' + category + '" does not exist.  Make sure to check your capitalization, as these are case sensitive.');
		}

		// Retrieve this user's permission for the raid category
		let permissions = discordCategory.permissionsFor(message.author);
		if (!permissions.has("MANAGE_CHANNELS")) {
			return message.channel.send('You do not have the manage channels permission for "' + category + '".  Unable to complete command.');
		}

		createRaidChannel(discordCategory);

	});


	function createRaidChannel(category) {
		if (!category) {
			message.channel.send('Raid sign-up category __' + category + '__ does not exist.');
			return false;
		}

		if (!raid || !name || !raidDate) {
			return message.channel.send('Invalid parameters.  Please use the following format: +raid MC Oct-15 <name?>');
		}

		const raidName = raidDate + '-' + name;
		message.guild.createChannel(raidName, {
				type: 'text'
			})
			.then((channel) => {
				let raidDateParts = raidDate.split('-');
				
				// Parse out our date
				raidDate = new Date(Date.parse(raidDateParts[0] + " " + raidDateParts[1]));
				raidDate.setFullYear(new Date().getFullYear());
				
				// If 'date' appears to be in the past, assume it's for the next calendar year (used for the dec => jan swapover)
				if (raidDate.getTime() < new Date().getTime()) {
					raidDate.setFullYear(raidDate.getFullYear() + 1);
				}

				// Set up our sql record
				let record = {
					// 'name': name,
					'raid': raid,
					'date': raidDate,
					'color': '#02a64f',
					'description': null,
					'channelID': channel.id,
					'guildID': channel.guild.id,
					'memberID': message.author.id
				};
				client.models.raid.create(record);

				let signupMessage = '-';
				channel.setParent(category.id)
					.then((channel) => {
						channel.lockPermissions()
							.then(() => console.log('Successfully synchronized permissions with parent channel'))
							.catch(console.error);
					});

				channel.send(signupMessage).then((botMsg) => {
					reactEmoji(botMsg);
					botMsg.pin().then(() => {
						client.embed.update(botMsg, raidName);
					});
				});
			});
	}

	async function reactEmoji(msg) {
		const emojis = ["👍", "🤷", "👎"];
		for (i = 0; i < emojis.length; i++) {
			await msg.react(emojis[i]);
		}
	}

}