exports.run = (client, message, args) => {

	// Delete channel
	message.delete().catch(O_o=>{}); 

	// Retrieve our category
	var raidCategory = client.customOptions.get(message.guild, 'raidcategory');
	if (!raidCategory) {
		return message.channel.send('Unable to create raid.  Please create a channel category called "Raid Signups" to use this command, or use +setoption to set a "raidcateory" value. ' + raidCategory);
	}
	
	let category = message.guild.channels.find(c => c.name == raidCategory.trim() && c.type == "category");
	if (!category) {
		return message.channel.send('Unable to create raid.  Please create a channel category called "Raid Signups" to use this command, or use +setoption to set a "raidcateory" value. ' + raidCategory);
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

	async function reactEmoji(msg) {
		const emojis = ["👍", "🤷", "👎"];
		for (i = 0; i < emojis.length; i++) {
			await msg.react(emojis[i]);
		}
	}

}