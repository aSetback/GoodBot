const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('unsigned')
    .setDescription('Ping unsigned raiders from the previous raid.')
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
        
    let channel = interaction.options.getChannel('channel');
    let raid = await client.raid.get(client, interaction.channel);
    let oldRaid;
    if (channel) {
        oldRaid = await client.raid.get(client, channel);
    }

    if (!oldRaid) {
        return interaction.editReply('This command can only be used on a raid channel.');
    }

    pingList = await client.notify.getUnsigned(client, raid, oldRaid);

    if (pingList.length == 0) {
        interaction.channel.send('No players were found.');
    } else {
        let notifications = await client.notify.makeList(client, interaction.guild, pingList);
        interaction.channel.send(notifications);
    }

    return interaction.editReply('Command successful.');
}
