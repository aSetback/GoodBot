const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	// This can't be used via DM
	if (!message.guild) {
		return false;
	}

	// Make sure an argument was provided
	if (!args[0]) {
		return false;
	}

	// Check permissions on the category
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return message.channel.send('Unable to complete command -- you do not have permission to manage this channel.');
	}	
	
	let playerArray = client.general.parseList(args);

	// Keep a record of which players are added
	let unconfirmedPlayers = [];
	let notFound = [];

	let raid = await client.raid.get(client, message.channel);

	if (args[0].toLowerCase() == 'all') {
		await client.models.signup.update({ 'confirmed': 0 }, {where: {raidID: raid.id, signup: 'yes'}})
	} else {
		// Loop through the players to confirm
		for (key in playerArray) {
			let player = client.general.ucfirst(playerArray[key]);
			let confirmed = await client.signups.unconfirm(client, raid.id, player);
			if (confirmed) {
				unconfirmedPlayers.push(player);
			} else {
				notFound.push(player);
			}
		}

		// Notify the user which players were confirmed
		if (unconfirmedPlayers.length) {
			message.author.send('Removed confirmation for players: ' + unconfirmedPlayers.join(', ') + ' for  **' + message.channel.name + '**.');
		}
		if (notFound.length) {
			message.author.send('Could not find players: ' + notFound.join(', ') + ' for **' + message.channel.name + '**.');
		}
	}

	// Update our embed
	client.embed.update(client, message.channel);

};