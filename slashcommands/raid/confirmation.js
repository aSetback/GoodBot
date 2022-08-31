const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('confirmation')
    .setDescription('Toggle confirmation mode for a raid.');

exports.data = commandData;

exports.run = async (client, interaction) => {
    // Get our raid information
    let raid = await client.raid.get(client, interaction.channel);

	let confirmation = 1;
	if (raid.confirmation) {
		confirmation = 0;
	}

	client.models.raid.update(
		{
			confirmation: confirmation
		},
		{
		where: {
			id: raid.id
		}
	}).then(() => {
		// Update our embed
		client.embed.update(client, interaction.channel);
	});

    let returnText = 'Confirmation mode has been ';
    returnText += confirmation ? 'enabled.' : 'disabled';

    interaction.reply({content: returnText, ephemeral: true});
}
