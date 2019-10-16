exports.run = (client, message, args) => {

	if (!message.isAdmin) {
		return false;
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