exports.run = async (client, message, args) => {

	if (!client.permission.manageChannel(message.member, message.channel)) {
		return message.channel.send('You need permission to manage this channel to be able to archive it.')
	}

	let category = message.guild.channels.find(c => c.name == "Archives" && c.type == "category");
	if (category) {
		try {
			await message.channel.setParent(category.id);
			message.channel.lockPermissions();
		} catch (e) {
			if (e.message.indexOf('Maximum number')) {
				let errorArchiveMaxChannel = client.loc('errorMaxChannel', "The category **Archives** is full, this channel could not be moved.");
				client.messages.errorMessage(message.channel, errorArchiveMaxChannel, 240);
			}
		}
	} else {
		let errorArchiveNoChannel = client.loc('errorMaxChannel', "The category **Archives** does not exist, please create the category to use this command.");
		client.messages.errorMessage(message.channel, errorArchiveNoChannel, 240);
	}
}