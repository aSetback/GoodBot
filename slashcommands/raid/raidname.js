const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent, SelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('raidname')
    .setDescription('Set the name for the raid.')
    .addStringOption(option =>
		option
            .setName('name')
			.setDescription('input')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    // Check permissions on the category
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply('Unable to complete command -- you do not have permission to manage this channel.');
	}	

    let name = interaction.options.getString('name');
	let raid = await client.raid.get(client, interaction.channel);
    await client.raid.setName(client, raid, name)
    
    // Update our embed
	client.embed.update(client, interaction.channel);
    return interaction.reply({content: "Raid name has been updated.", ephemeral: true, components: []});
}
