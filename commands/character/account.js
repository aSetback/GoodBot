exports.run = (client, message, args) => {

	const characterName = client.general.ucfirst(args.shift());
	const account = client.general.ucfirst(args.shift());
    let memberID = account.substr(2, account.length-3);

    if (!message.guild) {
		return false;
	}
	
	if (!characterName || !account) {
		return client.messages.send(message.channel, 'Invalid parameters.  Correct usage is: +account character @playertag', 240);
	}

	client.models.character.findOne({where: {name: characterName, guildID: message.guild.id}}).then((character) => {
		if (!character) {
			return client.messages.errorMessage(message.channel, 'Could not find character: ' + characterName, 240);
        }
        client.models.character.update({pingMemberID: memberID}, {where: {id: character.id}});
    });		
};