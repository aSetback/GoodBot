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

	// Fallback for if there are spaces in the name
	let fullCharacterName = args.join(' ');

	// Remove the first arg from the array.
	let characterName = args.shift();

	let raid = await client.signups.getRaid(client, message.channel);

	// Remove the sign-up
	let success = await client.signups.remove(client, raid.id, characterName);
	if (!success && (characterName != fullCharacterName)) {
		success = await client.signups.remove(client, raid.id, fullCharacterName);
	}

	if (!success) {
		let errorNotFound = client.loc('errorRemoveNotFound', 'Could not find character **' + fullCharacterName + '** in the sign-ups.', 240);
		client.messages.errorMessage(message.channel, errorNotFound, 240);
	}

	client.embed.update(client, message, raid);
}