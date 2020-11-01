exports.run = async (client, message, args) => {
    
    // This can't be used via DM
	if (!message.guild) {
		return false;
	}

	// Check permissions on the category
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return message.channel.send('Unable to complete command -- you do not have permission to manage this channel.');
	}	

    let oldRaidChannel = args.shift();

	// Check for required parameter
	if (!oldRaidChannel) {
		return message.channel.send('Proper usage is: +copyconfirmation mar-21-tagalong');
	}

	// Pull discord.js object
	oldChannel = await client.general.getChannel(oldRaidChannel, message.guild);

	// Check that the channel exists
	if (!oldChannel) {
		return message.channel.send('Unable to find channel: ' + oldRaidChannel);
	}
    
    let oldRaid = await client.raid.get(client, oldChannel);
    let newRaid = await client.raid.get(client, message.channel);
    if (!oldRaid) {
        client.messages.errorMessage(message.channel, client.loc('dupeNoRaid', `${oldChannel}` + " is not a valid raid channel, could not duplicated."), 240);
    }

    if (!oldRaid.confirmation) {
        client.messages.errorMessage(message.channel, client.loc('dupeNoRaid', `${oldChannel}` + " did not have confirmation mode enabled."), 240);
    }

    oldRaid.signups.forEach(async (signup) => {
        if (signup.confirmed && signup.signup == 'yes') {
            await client.signups.confirm(client, newRaid.id, signup.character.name).catch(console.error);
        }
    });

	// Update our embed
	client.embed.update(client, message.channel); 

}