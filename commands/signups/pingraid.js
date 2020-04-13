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
	
	let raid = await client.signups.getRaid(client, message.channel);
	let signups = await client.signups.getSignups(client, raid);
	let pingList = [];
	for (key in signups) {
		let signup = signups[key];
		if (signup.signup == 'yes') {
			pingList.push(signup.player);
		}
	}
	let mentionText = await client.notify.makeList(client, message.guild, pingList);
	message.channel.send(mentionText);
}
