const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('pingid')
    .setDescription('Set up an ping ID.');

exports.data = commandData;

exports.run = async (client, interaction) => {
    let modal = new Modal()
        .setCustomId('sc-modal-pingid')
        .setTitle('Set up an ping ID');

    let input1 = new TextInputComponent()
        .setCustomId('main')
        .setLabel('What is the character name?')
        .setRequired(true)
        .setStyle('SHORT');

    let input2 = new TextInputComponent()
        .setCustomId('pingid')
        .setLabel('What is the ping ID?')
        .setRequired(true)
        .setStyle('SHORT');

        let ActionRow1 = new MessageActionRow().addComponents(input1);
        let ActionRow2 = new MessageActionRow().addComponents(input2);
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
