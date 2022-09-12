const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('raidleader')
    .setDescription('Set the raid leader for the raid.')
    .addUserOption(option =>
		option
            .setName('leader')
			.setDescription('Raid Leader')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    // Check permissions on the category
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply('Unable to complete command -- you do not have permission to manage this channel.');
	}	

    let leader = interaction.options.getUser('leader');
	let raid = await client.raid.get(client, interaction.channel);
    await client.raid.setLeader(client, raid, leader.id)

    // Update our embed
	client.embed.update(client, interaction.channel);
    return interaction.reply({content: "Raid leader has been updated.", ephemeral: true, components: []});
}
