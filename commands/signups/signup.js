exports.run = async function(client, message, args) {
	// This can't be used via DM
	if (!message.guild) {
		return false;
	}

	// Make sure an argument was provided
	if (!args[0]) {
		return false;
	}

	// Check permissions on the category
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return message.channel.send('Unable to complete command -- you do not have permission to manage this channel.');
	}	

	let playerArray = client.general.parseList(args);

    // Keep a record of which players are added
	let signedPlayer = [];

	// Loop through the players to confirm
	for (key in playerArray) {
		let player = playerArray[key];
		await client.signups.set("+", player, message.channel, message, client);
		signedPlayer.push(player);
	}

	// Update our embed
	client.embed.update(client, message.channel);

	// Notify the user which players were confirmed
	message.author.send('Signed up players: ' + signedPlayer.join(', ') + ' for ' + message.channel.name + '.');

};