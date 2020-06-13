exports.run = async (client, message, args) => {

	if (!client.permission.manageChannel(message.member, message.channel)) {
		return message.channel.send('You need permission to manage this channel to be able to archive it.')
	}

	let category = message.guild.channels.find(c => c.name == "Archives" && c.type == "category");
	if (category) {
		let newArchives = category.clone();
		category.setName('Archives-Old');
	} else {
		let errorArchiveNoChannel = client.loc('errorMaxChannel', "The category **Archives** does not exist, please create the category to use this command.");
		client.messages.errorMessage(message.channel, errorArchiveNoChannel, 240);
	}
}