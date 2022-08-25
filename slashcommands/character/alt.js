const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('alt')
    .setDescription('Set up an alt.');

exports.data = commandData;

exports.run = async (client, interaction) => {
    let modal = new Modal()
        .setCustomId('sc-modal-alt')
        .setTitle('Set up an alt');

    let input1 = new TextInputComponent()
        .setCustomId('alt')
        .setLabel('What is your alt\'s name?')
        .setRequired(true)
        .setStyle('SHORT');

    let input2 = new TextInputComponent()
        .setCustomId('main')
        .setLabel('What is your main\'s name?')
        .setValue(interaction.member.nickname ? interaction.member.nickname : interaction.user.username)
        .setRequired(true)
        .setStyle('SHORT');

        let ActionRow1 = new MessageActionRow().addComponents(input1);
        let ActionRow2 = new MessageActionRow().addComponents(input2);
        modal.addComponents([ActionRow1, ActionRow2]);

    await interaction.showModal(modal);
}

exports.modalResponse = async (client, interaction) => {
    let args = {
        alt: interaction.fields.getTextInputValue('alt'),
        main: interaction.fields.getTextInputValue('main')
    };
 
	altName = client.general.ucfirst(args.alt);
	mainName = client.general.ucfirst(args.main);

    // Retrieve our main
	let mainCharacter = await client.models.character.findOne({where: {name: mainName, guildID: interaction.guild.id}})
    if (!mainCharacter) {
        return interaction.reply({content: 'Could not find main: ' + mainName, ephemeral: true});
    }

    // Retrieve our alt
    let altCharacter = await client.models.character.findOne({where: {name: altName, guildID: interaction.guild.id}})
    if (!altCharacter) {
        return interaction.reply({content: 'Could not find alt: ' + altName, ephemeral: true});
    }

    // Set the main character as a "main" if it's not already.
    if (mainCharacter.mainID) {
        client.models.character.update({mainID: null}, {where: {id: mainCharacter.id}});
    }

    // Update the alt character to have a main character 
    client.models.character.update({mainID: mainCharacter.id}, {where: {id: altCharacter.id}}).then(() => {
        return interaction.reply({content: mainName + ' is set as the main for ' + altName + '.', ephemeral: true});
    });
}
