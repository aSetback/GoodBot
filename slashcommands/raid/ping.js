const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent, SelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Ping a group of raiders.')
    .addStringOption(option =>
		option
            .setName('type')
			.setDescription('input')
			.setRequired(true)
    )
    .addChannelOption(option =>
		option
            .setName('channel')
			.setDescription('Channel Name')
			.setRequired(false)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    // Check permissions on the category
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.editReply('Unable to complete command -- you do not have permission to manage this channel.');
	}	
    let type = interaction.options.getString('type').toLowerCase();
    let channel = interaction.options.getChannel('channel');
    let raid = await client.raid.get(client, interaction.channel);
    let oldRaid;
    if (channel) {
        oldRaid = await client.raid.get(client, channel);
    }
    if (!raid || (channel & !oldRaid)) {
		return interaction.editReply({content: 'This command can only be used in a raid channel.', ephemeral: true});
    }
    if (type == 'unsigned' && !channel) {
		return interaction.editReply({content: 'You must specify a raid channel to ping unsigned.', ephemeral: true});
    }

    let pingList = [];
    let list = [];

    if (type == 'confirmed') {
        list = raid.signups.filter(signup => signup.confirmed == 1);
    }
    if (type == 'raid') {
        list = raid.signups.filter(signup => signup.signup == 'yes');
    }
    if (type == 'class') {
        list = raid.signups.filter(signup => signup.signup == 'yes' && signup.character.class.toLowerCase() == filterArg.toLowerCase());
    }
    if (type == 'role') {
        list = raid.signups.filter(signup => signup.signup == 'yes' && signup.character.role.toLowerCase() == filterArg.toLowerCase());
    }
    if (type == 'unsigned') {  
        if (!oldRaid) {
            return interaction.editReply('This command can only be used on a raid channel.');
        }

        pingList = await client.notify.getUnsigned(client, raid, oldRaid);
    } else {
        for (key in list) {
            pingList.push(list[key].character.name);
        }
    }
        
    if (pingList.length == 0) {
        interaction.channel.send('No players were found.');
    } else {
        let notifications = await client.notify.makeList(client, interaction.guild, pingList);
        interaction.channel.send(notifications);
    }
    return interaction.editReply('Command successful.');
}
