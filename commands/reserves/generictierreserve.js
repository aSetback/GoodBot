const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

	let raid = await client.signups.getRaid(client, message.channel);

	client.models.raid.update(
		{
			genericTierReserve: !raid.genericTierReserve
		},
		{
		where: {
			id: raid.id
		}
	}).then(() => {
        // Update our embed
        console.log("Generic Tier Reserve Toggled " + (!raid.genericTierReserve ? 'ON' : 'OFF' ));
        message.author.send("Generic Tier Reserve Toggled " + (!raid.genericTierReserve ? 'ON' : 'OFF' ));
		client.embed.update(client, message, raid);
	});
};