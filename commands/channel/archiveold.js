exports.run = async (client, message, args) => {
	
	if (!message.isAdmin) {
		return false;
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