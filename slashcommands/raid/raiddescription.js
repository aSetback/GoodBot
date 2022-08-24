const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent, SelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('raiddescription')
    .setDescription('Set the description for the raid.')
    .addStringOption(option =>
		option
            .setName('description')
			.setDescription('A description of the raid.')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    // Check permissions on the category
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply('Unable to complete command -- you do not have permission to manage this channel.');
	}	

    let description = interaction.options.getString('description');
	let raid = await client.raid.get(client, interaction.channel);
    await client.raid.setDescription(client, raid, description)
    
    // Update our embed
	client.embed.update(client, interaction.channel);
    return interaction.reply({content: "Raid description has been updated.", ephemeral: true, components: []});
}
