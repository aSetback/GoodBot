const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

	let raid = await client.raid.get(client, message.channel);
	let title = args.join(" ");
	await client.raid.setTitle(client, raid, title)

	// Update our embed
	client.embed.update(client, message, raid);
};