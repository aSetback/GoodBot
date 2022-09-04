const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('softreserve')
    .setDescription('Toggle soft reserve for a raid.');

exports.data = commandData;

exports.run = async (client, interaction) => {
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply('Unable to complete command -- you do not have permission to manage this channel.');
	}	
	
	// Get our raid information
    let raid = await client.raid.get(client, interaction.channel);

	let softreserve = 1;
	if (raid.softreserve) {
		softreserve = 0;
	}

	client.models.raid.update(
		{
			softreserve: softreserve
		},
		{
		where: {
			id: raid.id
		}
	}).then(() => {
		// Update our embed
		client.embed.update(client, interaction.channel);
	});

    let returnText = 'Soft reserve has been ';
    returnText += softreserve ? 'enabled.' : 'disabled';

    interaction.reply({content: returnText, ephemeral: true});
}
