const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('raidtype')
    .setDescription('Set the type for the raid.')
    .addStringOption(option =>
		option
            .setName('type')
			.setDescription('Raid Type')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    // Check permissions on the category
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply('Unable to complete command -- you do not have permission to manage this channel.');
	}	

    let type = interaction.options.getString('type');
	let raid = await client.raid.get(client, interaction.channel);
    await client.raid.setRaid(client, raid, type)

    // Update our embed
	client.embed.update(client, interaction.channel);
    return interaction.reply({content: "Raid type has been updated.", ephemeral: true, components: []});
}
