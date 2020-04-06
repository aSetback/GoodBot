const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!message.isAdmin) {
		return false;
	}

	let raid = await client.raid.get(client, message.channel);
	let description = args.join(" ");
	await client.raid.setDescription(client, raid, description)

	// Update our embed
	client.embed.update(client, message, raid);
};