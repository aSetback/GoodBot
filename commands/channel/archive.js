exports.run = async (client, message, args) => {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return message.channel.send('You need permission to manage this channel to be able to archive it.')
	}
	let raid = await client.raid.get(client, message.channel);
	if (!raid) {
		return message.channel.send('This command can only be used on raid channels.')
	}
	client.raid.archive(client, raid);
}