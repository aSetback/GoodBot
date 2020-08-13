const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

	let raid = await client.raid.get(client, message.channel);
	let softreserve = 1;
	if (raid.softreserve) {
		softreserve = 0;
	}

	client.models.raid.update(
		{
			softreserve: softreserve
		},
		{
		where: {
			id: raid.id
		}
	}).then(() => {
		// Update our embed
		client.embed.update(client, message.channel);
	});

};