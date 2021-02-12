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

	// Get the first parameter as either player, or player list.
	let players = args.join().toLowerCase();
	// Attempt to split on comma to see if it's a list
	players = players.split(',');
	// Keep a record of which players are added
	let confirmedPlayers = [];
	let notFound = [];

	let raid = await client.raid.get(client, message.channel);
	if (args[0].toLowerCase() == 'all') {
		await client.models.signup.update({ 'confirmed': 1 }, {where: {raidID: raid.id, signup: 'yes'}})
	} else {
		// Loop through the players to confirm
		for (key in players) {
			let player = client.general.ucfirst(players[key]);
			let confirmed = await client.signups.confirm(client, raid.id, player);
			if (confirmed) {
				confirmedPlayers.push(player);
			} else {
				notFound.push(player);
			}
		}

		// Notify the user which players were confirmed
		if (confirmedPlayers.length) {
			message.author.send('Added confirmation for players: ' + confirmedPlayers.join(', ') + ' for  **' + message.channel.name + '**.');
		}
		if (notFound.length) {
			message.author.send('Could not find players: ' + notFound.join(', ') + ' for **' + message.channel.name + '**.');
		}
	}

	// Update our embed
	client.embed.update(client, message.channel);

};