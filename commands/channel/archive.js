exports.run = async (client, message, args) => {
	// Check to see if the user has permission to archive this channel
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return client.messages.errorMessage(message.channel, 'You need permission to manage this channel to be able to archive it.', 240);
	}
	
	// Retrieve our raid information
	let raid = await client.raid.get(client, message.channel);

	// If this is not a raid channel, do not allow the channel to be archived
	if (!raid) {
		return client.messages.errorMessage(message.channel, 'This command can only be used on raid channels.', 240);
	}

	// Archive the raid
	client.raid.archive(client, raid);
}