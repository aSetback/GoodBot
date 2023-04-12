const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('unlink')
    .setDescription('Unlink a character\'s alts.')
    .addStringOption(option =>
		option
            .setName('character')
			.setDescription('input')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
	let character = interaction.options.getString('character').toLowerCase();

    // Retrieve our main
	let mainCharacter = await client.models.character.findOne({where: {name: character, guildID: interaction.guild.id}})
    if (!mainCharacter) {
        return interaction.reply({content: 'Could not find character: ' + character, ephemeral: true});
    }

    // Set the main character as a "main" if it's not already.
    if (mainCharacter.mainID) {
        client.models.character.update({mainID: null}, {where: {id: mainCharacter.id}});
    }
        
    return interaction.reply({content: 'Character unlinked.', ephemeral: true});
}

