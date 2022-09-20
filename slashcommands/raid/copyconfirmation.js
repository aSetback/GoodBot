const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent, SelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('copyconfirmation')
    .setDescription('Copy the confirmations from another raid.')
    .addChannelOption(option =>
		option
            .setName('channel')
			.setDescription('Channel Name')
			.setRequired(false)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {

	// Check permissions on the category
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.editReply('Unable to complete command -- you do not have permission to manage this channel.');
	}	

    let oldChannel = interaction.options.getChannel('channel');
    let oldRaid = await client.raid.get(client, oldChannel);
    let newRaid = await client.raid.get(client, interaction.channel);
    if (!oldRaid) {
        return interaction.reply({content: `${oldChannel}` + " is not a valid raid channel, could not duplicated.", ephemeral: true});
    }

    if (!oldRaid.confirmation) {
        return interaction.reply({content: `${oldChannel}` + " did not have confirmation mode enabled.", ephemeral: true});
    }

    for (key in oldRaid.signups) {
        let signup = oldRaid.signups[key];
        if (signup.confirmed && signup.signup == 'yes') {
            await client.signups.confirm(client, newRaid.id, signup.character.name).catch(console.error);
        }
    }

	// Update our embed
	client.embed.update(client, interaction.channel);
    return interaction.reply({content: "Confirmations have been copied from " + `${oldChannel}` + ".", ephemeral: true});
}
