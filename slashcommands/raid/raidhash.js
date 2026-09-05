const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('raidhash')
    .setDescription('Link your goodbot.me account so soft reserve links appear on your raids.')
    .addStringOption(option =>
		option
            .setName('hash')
			.setDescription('Your goodbot.me raid hash')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply({ content: 'Unable to complete command -- you do not have permission to manage this channel.', ephemeral: true });
	}

    let hash = interaction.options.getString('hash');

    let raidHash = await client.models.raidHash.findOne({ where: { memberID: interaction.user.id, guildID: interaction.guild.id } });
    if (raidHash) {
        await client.models.raidHash.update({ hash: hash }, { where: { id: raidHash.id } });
        interaction.reply({ content: 'Your raid hash has been updated to: **' + hash + '**.', ephemeral: true });
    } else {
        await client.models.raidHash.create({ memberID: interaction.user.id, guildID: interaction.guild.id, hash: hash });
        interaction.reply({ content: 'Your raid hash has been created: **' + hash + '**.', ephemeral: true });
    }
}
