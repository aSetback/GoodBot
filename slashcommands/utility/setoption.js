const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('setoption')
    .setDescription('Set a server-wide option.')
    .addStringOption(option =>
		option
            .setName('name')
			.setDescription('Option Name')
			.setRequired(true)
			.addChoices(
                { name: 'Faction', value: 'faction' },
                { name: 'WoW Server', value: 'server' },
                { name: 'Multi Faction Server', value: 'multifaction'},
                { name: 'Enable Class Roles', value: 'classrole'},
                { name: 'Complete Role', value: 'completerole'},
                { name: 'Google Sheet ID', value: 'sheet'},
                { name: 'Warcraft Logs API Key', value: 'warcraftlogskey'},
                { name: 'Expansion', value: 'expansion'}
            )
    )
    .addStringOption(option =>
		option
            .setName('value')
			.setDescription('Option Value')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {

    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
        return false;
    }
    
    let optionName = interaction.options.getString('name');
    let optionValue = interaction.options.getString('value');
    
	client.models.settings.findOne({where: {guildID: interaction.guild.id}}).then((settings) => {
		let record = {
			guildID: interaction.guild.id
		}
		record[optionName] = optionValue;
		if (settings) {
			client.models.settings.update(record, {where: {id: settings.id}}).then(() => {
				return interaction.reply({ content: 'Option saved.', ephemeral: true});
			});
		} else {
			client.models.settings.create(record).then(() => {
				return interaction.reply({ content: 'Option saved.', ephemeral: true});
			});
		}
	});


}
