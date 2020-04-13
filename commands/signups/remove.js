const fs = require("fs");

exports.run = async function(client, message, args) {

	// This can't be used via DM
	if (!message.guild) {
		return false;
	}

	// Check permissions on the category
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return message.channel.send('Unable to complete command -- you do not have permission to manage this channel.');
	}	

	let characterName = args.shift();
	let raid = await client.signups.getRaid(client, message.channel);

	// Remove the sign-up
	client.signups.remove(client, raid.id, characterName);
	client.embed.update(client, message, raid);
}