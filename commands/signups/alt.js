const fs = require("fs");
const Discord = require("discord.js");


exports.run = (client, message, args) => {

	const altName = client.general.ucfirst(args.shift());
	const mainName = client.general.ucfirst(args.shift());
	
	if (!altName || !mainName) {
		return message.channel.send('Invalid parameters.  Correct usage is: +alt altName mainName');
	}

	client.models.character.findOne({where: {name: mainName, guildID: message.guild.id}}).then((mainCharacter) => {
		if (!mainCharacter) {
			return message.channel.send('Could not find main: ' + mainName);
		}
		client.models.character.findOne({where: {name: altName, guildID: message.guild.id}}).then((altCharacter) => {
			if (!altCharacter) {
				return message.channel.send('Could not find alt: ' + altName);
			}
			if (mainCharacter.mainID) {
				client.models.character.update({mainID: null}, {where: {id: mainCharacter.id}});
			}
			client.models.character.update({mainID: mainCharacter.id}, {where: {id: altCharacter.id}}).then(() => {
				message.channel.send(mainName + ' is set as the main for ' + altName + '.');
			});
		});
	});		
};