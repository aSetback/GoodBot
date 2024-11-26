const { ActionRowBuilder , StringSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('raiddate')
    .setDescription('Set the date for the raid.')
    .addStringOption(option =>
		option
            .setName('date')
			.setDescription('input')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    // Check permissions on the category
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply('Unable to complete command -- you do not have permission to manage this channel.');
	}	

    let date = interaction.options.getString('date');
	let raid = await client.raid.get(client, interaction.channel);
    await client.raid.setDate(client, raid, date)
    
    // Update our embed
	client.embed.update(client, interaction.channel);
    return interaction.reply({content: "Raid date has been updated to " + date + ".", ephemeral: true, components: []});
}
