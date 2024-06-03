const { ActionRowBuilder , StringSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('raidtitle')
    .setDescription('Set the title for the raid.')
    .addStringOption(option =>
		option
            .setName('title')
			.setDescription('input')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    // Check permissions on the category
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply('Unable to complete command -- you do not have permission to manage this channel.');
	}	

    let title = interaction.options.getString('title');
	let raid = await client.raid.get(client, interaction.channel);
    await client.raid.setTitle(client, raid, title)
    
    // Update our embed
	client.embed.update(client, interaction.channel);
    return interaction.reply({content: "Raid title has been updated.", ephemeral: true, components: []});
}
