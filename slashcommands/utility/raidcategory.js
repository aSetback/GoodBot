const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('raidcategory')
    .setDescription('Set a channel category for a raid type.')
    .addStringOption(option =>
		option
            .setName('type')
			.setDescription('Raid Type')
			.setRequired(true)
    )
    .addStringOption(option =>
		option
            .setName('category')
			.setDescription('Raid Category')
			.setRequired(true)
    )
    .addStringOption(option =>
		option
            .setName('faction')
			.setDescription('Faction')
			.setRequired(false)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {

    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
        return false;
    }
    
    let type = interaction.options.getString('type');
    let category = interaction.options.getString('category');
    let faction = interaction.options.getString('faction');
    let factionRequired = await client.raid.factionRequired(client, interaction.guild);
    if (factionRequired && !faction) {
        return interaction.reply({ content: 'This is a multi-faction server - please use the faction option while using the raidcategory command.', ephemeral: true});
    }

    let record = {
        raid: type,
        category: category,
        memberID: interaction.member.id,
        guildID: interaction.guild.id
    };
    let whereClause = {'raid': type, 'guildID': interaction.guild.id};
	
    // Add faction args if faction is required
    if (faction) {
        record.faction = faction;
        whereClause.faction = faction;
    }

    client.models.raidCategory.findOne({ where: whereClause }).then((raidCategory) => {
        if (!raidCategory) {
            client.models.raidCategory.create(record);
        } else {
            client.models.raidCategory.update(record, {
                where: {
                    id: raidCategory.id
                }
            });

        }
    });
    
    if (faction) {
        return interaction.reply({ content: 'Raid category for "' + type + '" is set as "' + category + '" for ' + faction + '.', ephemeral: true});
    } else {
        return interaction.reply({ content: 'Raid category for "' + type + '" is set as "' + category + '".', ephemeral: true});
    }
}
