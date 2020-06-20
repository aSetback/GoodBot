const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

	let raid = await client.signups.getRaid(client, message.channel);

	client.models.raid.update(
		{
			softreserve: !raid.softreserve
		},
		{
		where: {
			id: raid.id
		}
	}).then(() => {
		// Update our embed
		console.log("Soft Reserve Toggled " + (!raid.softreserve ? 'ON' : 'OFF' ));
		message.author.send("Soft Reserve Toggled " + (!raid.softreserve ? 'ON' : 'OFF' ));
		client.embed.update(client, message, raid);
	});
};