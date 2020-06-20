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

	let oldRaidChannel = args[0];
	if (!oldRaidChannel) {
		return message.channel.send('Proper usage is: +unsigned mar-21-tagalong');
	}

	let oldChannel = message.guild.channels.find(channel => channel.name == oldRaidChannel);
	if (!oldChannel) {
		return message.channel.send('Unable to find channel: ' + oldRaidChannel);
	}
	let oldRaid = await client.signups.getRaid(client, oldChannel);
	let oldSignups = await client.signups.getSignups(client, oldRaid);

	let newRaid = await client.signups.getRaid(client, message.channel);
	let newSignups = await client.signups.getSignups(client, newRaid);

	let unsigned = [];
	for (oldKey in oldSignups) { 
		let match = false;
		let playerName = oldSignups[oldKey].player;
		for (newKey in newSignups) {
			if (playerName == newSignups[newKey].player) {
				match = true;
			}
		}
		if (!match) {
			unsigned.push(playerName);
		}
	}
	let mentions = await client.notify.makeList(client, message.guild, unsigned);
	message.channel.send("Players who were signed up for " + oldChannel + ": ");
	message.channel.send(mentions);

}

