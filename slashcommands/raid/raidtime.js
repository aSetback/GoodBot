const { ActionRowBuilder , StringSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('raidtime')
    .setDescription('Set the time for the raid.')
    .addStringOption(option =>
		option
            .setName('time')
			.setDescription('input')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    // Check permissions on the category
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply('Unable to complete command -- you do not have permission to manage this channel.');
	}	

    let time = interaction.options.getString('time');
	let raid = await client.raid.get(client, interaction.channel);
    await client.raid.setTime(client, raid, time)
    
    // Update our embed
	client.embed.update(client, interaction.channel);
    return interaction.reply({content: "Raid time has been updated to " + time + ".", ephemeral: true, components: []});
}
