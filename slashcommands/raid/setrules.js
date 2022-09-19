const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('setrules')
    .setDescription('Set the rules for a raid.')
    .addStringOption(option =>
		option
            .setName('rules')
			.setDescription('rules')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
        return false;
    }
    let rules = interaction.options.getString('rules');
    let raid = await client.raid.get(client, interaction.channel);
    await client.raid.setRules(client, raid, rules);
    return interaction.reply({ content: "Raid rules set.", ephemeral: true });
}