exports.run = async (client, message, args) => {

	if (!message.isAdmin) {
		return false;
	}
	
	const key = args.shift();
	const value = args.join(' ');
	
	if (!key || !value) {
		return message.channel.send('Invalid parameters.  Correct usage is: +setoption key value');
	}

    let response = await client.guildOption.set(client, message.guild.id, key, value);
	return client.messages.send(message.channel, response, 60);
};