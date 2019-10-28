exports.run = (client, message, args) => {

	if (!message.isAdmin) {
		return false;
	}
	
	var raidCategory = client.customOptions.get(message.guild, 'raidcategory').trim();
	console.log(raidCategory);
	const raid = args[0]
	const date = args[1];
	if (!raid || !date) {
		return message.channel.send('Invalid parameters.  Please use the following format: +raid MC Oct-15');
	}

	const raidName = raid + '-signups-' + date;
	var server = message.guild;

	let category = server.channels.find(c => c.name == raidCategory && c.type == "category");
	if (!category) {
		return message.channel.send('Unable to create raid.  Please create a channel category called "Raid Signups" to use this command, or use +setoption to set a "raidcateory" value. ' + raidCategory);
	}

	server.createChannel(raidName, 'text')
		.then((channel) => {
			let signupMessage = '-';
			channel.setParent(category.id);
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