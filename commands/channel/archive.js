exports.run = async (client, message, args) => {

	if (!client.permission.manageChannel(message.member, message.channel)) {
		return message.channel.send('You need permission to manage this channel to be able to archive it.')
	}
	let raid = await client.raid.get(client, message.channel);
	client.raid.archive(client, message.channel, raid);
}