const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('wav')
    .setDescription('Open a modal to play a wav.');

exports.data = commandData;
exports.run = async (client, interaction) => {
    let modal = new Modal()
        .setCustomId('sc-modal-wav')
        .setTitle('Play a WAV file');
    let input1 = new TextInputComponent()
        .setCustomId('wavName')
        .setLabel('WAV Name')
        .setRequired(true)
        .setStyle('SHORT');

    let ActionRow1 = new MessageActionRow().addComponents(input1);
    modal.addComponents([ActionRow1]);

    await interaction.showModal(modal);
}

exports.modalResponse = async (client, interaction) => {
	const cmd = client.commands.get('wav');
	cmd.run(client, interaction, interaction.fields.getTextInputValue('wavName'));
	interaction.deferUpdate();
}