const moment = require('moment');

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

	let channel = message.channel;
    let raid = await client.raid.get(client, channel);
    let limit = parseInt(args.shift());
    if (limit < 1 || !limit) { limit = 1; }

	if (limit < raid.reserveLimit) {
		message.channel.send("**WARNING:** Reserve limit has been reduced.  All reserves for this raid have been cleared.");
		await client.models.raidReserve.destroy({ where: {'raidID': raid.id }});
	}

	client.models.raid.update(
		{
			reserveLimit: limit
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