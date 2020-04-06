const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!message.isAdmin) {
		return false;
	}

	let raid = await client.signups.getRaid(client, message.channel);
	let confirm = 1;
	if (raid.confirmation) {
		confirm = 0;
	}

	client.models.raid.update(
		{
			confirmation: confirm
		},
		{
		where: {
			id: raid.id
		}
	}).then(() => {
		// Update our embed
		client.embed.update(client, message, raid);
	});

};