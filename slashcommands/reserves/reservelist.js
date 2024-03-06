const { SlashCommandBuilder } = require('@discordjs/builders');
const moment = require('moment');


let commandData = new SlashCommandBuilder()
    .setName('reservelist')
    .setDescription('Retrieve the list of reserves for a raid.')
    .addStringOption(option =>
		option
            .setName('type')
			.setDescription('Type of reserve list')
			.setRequired(false)
            .addChoices(
                { name: 'History', value: 'history' },
                { name: 'Channel', value: 'channel' }
            )
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    let raid = await client.raid.get(client, interaction.channel);
    let type = interaction.options.getString('type');
    let ephemeral = type == "channel" ? false : true;
    let guildID = interaction.guild.id;
    if (!raid) {
        return interaction.reply({content: 'This command is only usable from a raid channel.', ephemeral: ephemeral});
    }
    if (!raid.softreserve) {
        return interaction.reply({content: 'Soft reserve is not currently enabled for this raid.', ephemeral: ephemeral});
    }

    includes = [
        {model: client.models.signup, as: 'signup', foreignKey: 'signupID'},
        {model: client.models.reserveItem, as: 'item', foreignKey: 'reserveItemID'},
    ];
    
    client.models.raidReserve.findAll({where: {RaidID: raid.id}, include: includes}).then(async (raidReserves) => {
        let reserves = [];
        let reserveHistory;

        if (type && type == 'history') {
            reserveHistory = await client.raid.getReserveHistory(client, guildID, raid, type);
        }
        for (key in raidReserves) {
            let raidReserve = raidReserves[key];
            if (raidReserve.signup) {
                reserves.push(raidReserve);
            }
        }

        await interaction.reply({content: '```diff\n+ Raid: \n- ' + interaction.channel.name + '```', ephemeral: ephemeral});
        let returnMessage = '';
        reserves.sort((a, b) => {
            if (!a.signup || !b.signup) {
                return 0;
            }
            if (a.item.name > b.item.name) {
                return 1;
            }
            if (a.item.name < b.item.name) {
                return -1;
            }
            if (a.signup.player > b.signup.player) {
                return 1;
            }
            if (a.signup.player < b.signup.player) {
                return -1;
            }
            return 0;
        });

        reserves.forEach((reserve) => {
            if (reserve.signup && reserve.signup.signup == 'yes') { 
                if (!returnMessage.length) {
                    returnMessage = '-\n```md\n';
                    returnMessage += 'Player'.padEnd(20) + 'Item'.padEnd(50) +  'Reserved At'.padEnd(30);
                    if (type && type == 'history') {
                        returnMessage += 'Times Reserved';
                    }
                    returnMessage += '\n';
                    returnMessage += ''.padEnd(120, '-') + '\n';
                }
                returnMessage += reserve.signup.player.padEnd(20) + reserve.item.name.padEnd(50) + moment(reserve.updatedAt).utcOffset(-240).format('h:mm A, L').padEnd(30);
                if (type && type == 'history') {
                    if (reserveHistory[reserve.signup.player] && reserveHistory[reserve.signup.player][reserve.item.id]) {
                        returnMessage += reserveHistory[reserve.signup.player][reserve.item.id].count; 
                    } else {
                        returnMessage += '0';
                    }
                }
                returnMessage += '<@' + reserve.memberID + '>';
                returnMessage += '\n';
                if (returnMessage.length > 1800) {
                    returnMessage += '```';
                    interaction.followUp({content: returnMessage, ephemeral: ephemeral});
                    returnMessage = '';
                }
            }
        });
        if (returnMessage.length) {
            returnMessage += '```';
            interaction.followUp({content: returnMessage, ephemeral: ephemeral});
        }
    });
}
