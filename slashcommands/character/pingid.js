const { ActionRowBuilder , StringSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('pingid')
    .setDescription('Set up an ping ID.');

exports.data = commandData;

exports.run = async (client, interaction) => {
    if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.editReply('Unable to complete command -- you do not have permission to manage this channel.');
	}	
    
    let modal = new ModalBuilder()
        .setCustomId('sc-modal-pingid')
        .setTitle('Set up an ping ID');

    let input1 = new TextInputBuilder()
        .setCustomId('main')
        .setLabel('What is the character name?')
        .setRequired(true)
        .setStyle('Short');

    let input2 = new TextInputBuilder()
        .setCustomId('pingid')
        .setLabel('What is the ping ID?')
        .setRequired(true)
        .setStyle('Short');

        let ActionRow1 = new ActionRowBuilder().addComponents(input1);
        let ActionRow2 = new ActionRowBuilder().addComponents(input2);
        modal.addComponents([ActionRow1, ActionRow2]);

    await interaction.showModal(modal);
}

exports.modalResponse = async (client, interaction) => {
    let args = {
        main: interaction.fields.getTextInputValue('main'),
        pingid: interaction.fields.getTextInputValue('pingid')
    };
 
	mainName = client.general.ucfirst(args.main);
	pingID = client.general.ucfirst(args.pingid);

    // Retrieve our main
	let mainCharacter = await client.models.character.findOne({where: {name: mainName, guildID: interaction.guild.id}})
    if (!mainCharacter) {
        return interaction.reply({content: 'Could not find main: ' + mainName, ephemeral: true});
    }

    // Set the character's pingID
    if (mainCharacter.mainID) {
        client.models.character.update({pingID: pingID}, {where: {id: mainCharacter.id}});
    }

    return interaction.reply({content: mainName + ' has a ping ID of: ' + pingID + '.', ephemeral: true});
}
