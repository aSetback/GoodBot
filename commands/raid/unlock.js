exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

	let raid = await client.raid.get(client, message.channel);
    if (raid && raid.locked) {
        client.models.raid.update({locked: false}, {where: {id: raid.id}}).then(() => {
            // Update our embed
            client.embed.update(client, message, raid);
        });
    }

};