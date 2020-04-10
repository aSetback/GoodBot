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
		return message.channel.send('Unable to modify raid.  Please create a channel category called "Raid Signups" to use this command, or use +raidcategry to set a your category.');
	}	
	
	// Get the first parameter as either player, or player list.
	let players = args.shift().toLowerCase();
	// Attempt to split on comma to see if it's a list
	players = players.split(',');
	// Keep a record of which players are added
	let confirmedPlayers = [];

	let raid = await client.signups.getRaid(client, message.channel);
	// Loop through the players to confirm
	for (key in players) {
		let player = players[key];
		await client.signups.unconfirm(client, raid.id, player);
		confirmedPlayers.push(player);
	}

	// Update our embed
	client.embed.update(client, message, raid);

	// Notify the user which players were confirmed
	message.author.send('Removed confirmation for players: ' + confirmedPlayers.join(', ') + ' for ' + message.channel.name + '.');

};