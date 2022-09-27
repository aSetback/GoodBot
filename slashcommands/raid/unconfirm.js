const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent, SelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('unconfirm')
    .setDescription('Unconfirm a character for the raid.')
    .addStringOption(option =>
		option
            .setName('character')
			.setDescription('input')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    // Check permissions on the category
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply('Unable to complete command -- you do not have permission to manage this channel.');
	}	

    let character = client.general.ucfirst(interaction.options.getString('character'));
	let raid = await client.raid.get(client, interaction.channel);
    let confirmReply;
    if (character == 'All') {
        await client.models.signup.update({ 'confirmed': 0 }, {where: {raidID: raid.id, signup: 'yes'}})
        confirmReply = 'All players have been unconfirmed for this raid.';
    } else if (character.indexOf(',') >= 0) {
        let characters = character.split(',');
        for (key in characters) {
            let tempChar = characters[key].trim();
            await client.signups.unconfirm(client, raid.id, tempChar);
        }
        confirmReply = 'Confirmations for this raid have been updated.';
    } else {
        await client.signups.unconfirm(client, raid.id, character);
        confirmReply = character + ' has been unconfirmed for this raid.';
    }

    // Update our embed
	client.embed.update(client, interaction.channel);
    return interaction.reply({content: confirmReply, ephemeral: true, components: []});
}
