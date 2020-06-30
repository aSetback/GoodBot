exports.run = (client, message, args) => {

	const altName = client.general.ucfirst(args.shift());
	const mainName = client.general.ucfirst(args.shift());
	if (!message.guild) {
		return false;
	}
	
	if (!altName || !mainName) {
		return client.messages.send(message.channel, 'Invalid parameters.  Correct usage is: +alt altName mainName', 240);
	}

	client.models.character.findOne({where: {name: mainName, guildID: message.guild.id}}).then((mainCharacter) => {
		if (!mainCharacter) {
			return client.messages.errorMessage(message.channel, 'Could not find main: ' + mainName, 240);
		}
		client.models.character.findOne({where: {name: altName, guildID: message.guild.id}}).then((altCharacter) => {
			if (!altCharacter) {
				return client.messages.errorMessage(message.channel, 'Could not find alt: ' + altName, 240);
			}
			if (mainCharacter.mainID) {
				client.models.character.update({mainID: null}, {where: {id: mainCharacter.id}});
			}
			client.models.character.update({mainID: mainCharacter.id}, {where: {id: altCharacter.id}}).then(() => {
				return client.messages.send(message.channel, mainName + ' is set as the main for ' + altName + '.', 240);
			});
		});
	});		
};