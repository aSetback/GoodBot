exports.run = async (client, message, args) => {
	// Check to see if the user has permission to archive this channel
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return client.messages.errorMessage(message.channel, 'You need permission to manage this channel to be able to archive it.', 240);
	}

	// Archive the raid
	client.raid.archive(client, message.channel);
}