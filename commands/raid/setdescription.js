const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

	let raid = await client.raid.get(client, message.channel);
	let description = args.join(" ");
	await client.raid.setDescription(client, raid, description)

	// Update our embed
	client.embed.update(client, message.channel);
};