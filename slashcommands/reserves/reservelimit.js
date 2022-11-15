const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('reservelimit')
    .setDescription('Set a limit for number of reserves per player.')
    .addNumberOption(option =>
		option
            .setName('limit')
			.setDescription('Reserve Limit')
			.setRequired(true)
    );
exports.data = commandData;

exports.run = async (client, interaction) => {
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return false;
	}

    let args = {
        limit: interaction.options.getNumber('limit')
    };


	let channel = interaction.channel;
    let raid = await client.raid.get(client, channel);
    let limit = parseInt(args.limit);
    if (limit < 1 || !limit) { limit = 1; }

	if (limit < raid.reserveLimit) {
		interaction.reply("**WARNING:** Reserve limit has been reduced.  All reserves for this raid have been cleared.");
		await client.models.raidReserve.destroy({ where: {'raidID': raid.id }});
	}

	client.models.raid.update(
		{
			reserveLimit: limit
		},
		{
		where: {
			id: raid.id
		}
	}).then(() => {
		// Update our embed
		client.embed.update(client, interaction.channel);
        interaction.reply({content: 'Reserve limit has been updated.', ephemeral: true});
	});
}
