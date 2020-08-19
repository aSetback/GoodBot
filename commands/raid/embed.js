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
        message.channel.send(signupMessage).then((botMsg) => {
            reactEmoji(botMsg);
            botMsg.pin().then(() => {
                client.embed.update(client, message.channel);
            });
        });
    }

};

async function reactEmoji(msg) {
    const emojis = ["👍", "🤷", "👎"];
    for (i = 0; i < emojis.length; i++) {
        await msg.react(emojis[i]);
    }
}


