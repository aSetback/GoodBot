const { ActionRowBuilder , StringSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('archive')
    .setDescription('Archive a raid channel.');

exports.data = commandData;
exports.run = async (client, interaction) => {
	// Check to see if the user has permission to archive this channel
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply({content: 'You need permission to manage this channel to be able to archive it.', ephemeral: true})
	}

	// Archive the raid
	let result = await client.raid.archive(client, interaction.channel);
    if (result.success) {
        interaction.reply({content: 'This channel was archived by <@' + interaction.member.id + '>.'});
    } else {
        interaction.reply({content: result.message});
    }
}
