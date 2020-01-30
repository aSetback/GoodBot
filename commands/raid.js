exports.run = (client, message, args) => {

	const month = {
		'jan': '01',
		'feb': '02',
		'mar': '03',
		'apr': '04',
		'may': '05',
		'jun': '06',
		'jul': '07',
		'aug': '08',
		'sep': '09',
		'oct': '10',
		'nov': '11',
		'dec': '12'
	};

	// Delete channel
	message.delete().catch(O_o=>{}); 

	// Retrieve our category
	var raidCategory = client.customOptions.get(message.guild, 'raidcategory');
	if (!raidCategory) {
		raidCategory = 'Raid Signups';
	}

	let category = message.guild.channels.find(c => c.name == raidCategory.trim() && c.type == "category");
	if (category) {
		createRaidChannel(category);
	} else {
		// Create Category
		message.guild.createChannel(raidCategory, {'type': 'category'}).then((category) => {
			createRaidChannel(category);
		});
	}

	function createRaidChannel(category) {
		if (!category) {
			message.channel.send('Raid sign-up category __' + raidCategory + '__ does not exist.');
		}
		// Retrieve this user's permission for the raid category
		let permissions = category.permissionsFor(message.author);
		if (!permissions.has("MANAGE_CHANNELS")) {
			return message.channel.send('You do not have the manage channels permission for "' + raidCategory + '".  Unable to complete command.');
		}

		const raid = args[0]
		const date = args[1];
		if (!raid || !date) {
			return message.channel.send('Invalid parameters.  Please use the following format: +raid MC Oct-15');
		}

		const raidName = raid + '-signups-' + date;
		message.guild.createChannel(raidName, {
				type: 'text'
			})
			.then((channel) => {
				// Parse our date from the string
				let dateParts = args[1].split('-');
				let raidDate = new Date(Date.parse(dateParts[0] + " " + dateParts[1]));
				raidDate.setFullYear(new Date().getFullYear());
				if (raidDate.getTime() < new Date().getTime()) {
					raidDate.setFullYear(raidDate.getFullYear() + 1);
				}

				// Set up our sql record
				let record = {
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
					botMsg.pin();
					reactEmoji(botMsg);
					client.embed.update(botMsg, raidName);
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