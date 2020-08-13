const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

	let raid = await client.raid.get(client, message.channel);
	let raidType = args.join(" ");
	await client.raid.setRaid(client, raid, raidType);
	raid.raid = raidType;
	client.embed.update(client, message.channel);
};