const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('loaditems')
    .setDescription('Load soft reserve items for a raid type.')
    .addStringOption(option =>
		option
            .setName('type')
			.setDescription('Raid Type')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {

    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
        return false;
    }
    
    let raid = interaction.options.getString('type');
    let fileName = 'items/' + raid + '-items.json';
    let parsedList = {};
    if (fs.existsSync(fileName)) {
        currentList = fs.readFileSync(fileName, 'utf8');
        parsedList = JSON.parse(currentList);
    }
    for (key in parsedList) {        
        let item = parsedList[key];
        let record = {
            'itemID': item[0],
            'raid': item[1],
            'name': item[2]
        }
        client.models.reserveItem.findOne({where: {name: record.name, raid: record.raid}}).then((item) => {
            if (!item)  {
                client.models.reserveItem.create(record);
                console.log('Item created: ' + record.name);
            }
        });
    
    };
    return interaction.reply({content: "Items loaded.", ephemeral: true})

};