const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!message.isAdmin) {
		return false;
	}
    let raid = await client.raid.get(client, message.channel);
    if (!raid) {
        return false;
    }

    if (args[0] && args[0] == 'refresh') {
        client.embed.update(client, message.channel);
    } else {
        let signupMessage = 'embed';
        message.channel.send(signupMessage, client.buttonRow).then((botMsg) => {
            botMsg.pin().then(() => {
                client.embed.update(client, message.channel);
            });
        });
    }

};
