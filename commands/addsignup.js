exports.run = (client, message, args) => {

	if (!message.isAdmin) {
		return false;
	}
	
	const channel = args[0];
	var server = message.guild;
	
	if (!raid || !date) {
		return false;
	}

	/* I'm going to avoid moving these to a category since they should be generated 
	fairly infrequently, and it will prevent the need of creating the 'Raid Signups' category
	if it doesn't exist. */

	// let category = server.channels.find(c => c.name == "Raid Signups" && c.type == "category");
	server.createChannel(raidName, 'text')
		.then((channel) => {
			let signupMessage = 'Sign-ups';
			// channel.setParent(category.id);
			channel.send(signupMessage).then((botMsg) => {
				botMsg.pin();
				client.embed.update(botMsg, raidName);
				const fileName = './data/signupChannels.json';
				let currentChannels = {};
				if (fs.existsSync(fileName)) {
					channelData = fs.readFileSync(fileName, 'utf8');
					currentChannels = JSON.parse(channelData);
				}
			
				// I'm using an object to prevent duplication, even with the pointless keys
				currentChannels[channelName] = channelName;
				fs.writeFileSync(fileName, JSON.stringify(parsedLineup)); 
			});
		});
}