const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!message.isAdmin) {
		return false;
	}

    let signupMessage = '-';
    message.channel.send(signupMessage).then((botMsg) => {
        reactEmoji(botMsg);
        botMsg.pin().then(() => {
            client.embed.update(client, botMsg, raid);
        });
    });
};

async function reactEmoji(msg) {
    const emojis = ["👍", "🤷", "👎"];
    for (i = 0; i < emojis.length; i++) {
        await msg.react(emojis[i]);
    }
}


