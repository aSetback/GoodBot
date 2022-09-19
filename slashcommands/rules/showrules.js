const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('showrules')
    .setDescription('Show a rule set in a channel.')
    .addStringOption(option =>
		option
            .setName('rules')
			.setDescription('rules')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    let rules = interaction.options.getString('rules');
    client.models.raidRules.findOne({where: {name: rules, guildID: interaction.guild.id}}).then((raidRules) => {
        if (raidRules) {
            interaction.channel.send(raidRules.rules);
            interaction.reply({content: "Rules shown.", ephemeral: true});
        } else {
            interaction.reply({content: 'Rules "' + rules + '" was not found.', ephemeral: true});
        }
    });
}
