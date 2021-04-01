const fs = require("fs");
const Discord = require("discord.js");


exports.run = async function(client, message, args) {

	if (!message.guild) {
		return false;
	}

    if (!message.isAdmin) {
        return false;
    }

	const characterName = client.general.ucfirst(args[0]);
    client.models.character.findOne({where: {name: characterName, guildID: message.guild.id}}).then((character) => {
        if (character) {
            character.destroy();
            return message.channel.send('Character deleted.');
        }
    });
};