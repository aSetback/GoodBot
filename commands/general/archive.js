exports.run = (client, message, args) => {

	if (!client.permission.manageChannel(message.member, message.channel)) {
		return message.channel.send('You need permission to manage this channel to be able to archive it.')
	}

	let category = message.guild.channels.find(c => c.name == "Archives" && c.type == "category");
	if (category) {
		message.channel.setParent(category.id).then((channel) => {
			channel.lockPermissions();
		});
	} else {
		message.channel.send('Failed to archive this channel.  Please add a channel category called "Archives".')
	}
}