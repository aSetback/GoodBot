const fs = require("fs");

exports.run = async function(client, message, args) {
	// This can't be used via DM
	if (!message.guild) {
		return false;
	}

	// Check permissions on the category
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return message.channel.send('Unable to complete command -- you do not have permission to manage this channel.');
	}	

	// Determine type
	let type = args.shift();
	let oldRaidChannel = type;
	if (type == 'confirmed') {
		oldRaidChannel = args.shift();
	} 

	// Check for required parameter
	if (!oldRaidChannel) {
		return message.channel.send('Proper usage is: +unsigned mar-21-tagalong');
	}

	// Pull discord.js object
	oldChannel = await client.general.getChannel(oldRaidChannel, message.guild);

	// Check that the channel exists
	if (!oldChannel) {
		return message.channel.send('Unable to find channel: ' + oldRaidChannel);
	}

	// Retrieve our old raid & our current raid
	let oldRaid = await client.raid.get(client, oldChannel);
	let newRaid = await client.raid.get(client, message.channel);
	
	// Set up vars
	let unsigned = [];

	// Filter if necessary
	let signups = oldRaid.signups;
	if (type == 'confirmed') {
		signups = signups.filter(s => s.confirmed == 1);
	}

	// Loop through and check if each player is signed up
	signups.forEach((signup) => {
		if (signup.character && !newRaid.signups.find(s => s.character.id == signup.character.id)) {
			unsigned.push(signup.character.name);
		}
	});

	// Do player/alt looks-ups
	let mentions = await client.notify.makeList(client, message.guild, unsigned);

	// Send message
	if (mentions.length) {
		message.channel.send("Players who were signed up for " + `${oldChannel}` + ": ");
		message.channel.send(mentions);
	} else {
		message.channel.send('All players are currently signed up.');
	}

}

