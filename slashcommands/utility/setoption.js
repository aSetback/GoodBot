const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('setoption')
    .setDescription('Set a server-wide option.')
    .addStringOption(option =>
		option
            .setName('name')
			.setDescription('Option Name')
			.setRequired(true)
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
    
	if (optionName == 'raidcategory' || optionName == 'server' || optionName == 'region') {
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
	} else {
		// Write to class json file
		let fileName = 'data/' + interaction.guild.id + '-options.json';
		let parsedList = {};
		if (fs.existsSync(fileName)) {
			currentList = fs.readFileSync(fileName, 'utf8');
			parsedList = JSON.parse(currentList);
		}
		parsedList[optionName] = optionValue;
		fs.writeFileSync(fileName, JSON.stringify(parsedList)); 
        return interaction.reply({ content: 'Option saved.', ephemeral: true});
	}

}
