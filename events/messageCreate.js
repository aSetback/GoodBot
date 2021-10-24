module.exports = async (client, message) => {
	client.messages.handle(client, message);
	if (message.channel.type == 'dm') { client.wizard.handleMessage(client, message); }
};