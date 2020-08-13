const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

	let raid = await client.raid.get(client, message.channel);
	await client.raid.setName(client, raid, args.join(' '));

	// Update our embed
	client.embed.update(client, message.channel);
};