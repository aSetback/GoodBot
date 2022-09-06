const fs = require("fs");

exports.run = async function(client, message, args) {


	// Do player/alt looks-ups
	let mentions = await client.notify.makeList(client, message.guild, unsigned);

	// Send message
	if (mentions.length) {
		message.channel.send("Players who were signed up for " + `${oldChannel}` + ": ");
		message.channel.send(mentions);
	} else {
		message.channel.send('All players are currently signed up.');
	}

}

