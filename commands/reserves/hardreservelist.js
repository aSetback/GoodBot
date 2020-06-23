const moment = require('moment');

exports.run = async function(client, message, args) {
	let raid = await client.signups.getRaid(client, message.channel);

    let sendTo = message.author;
	if (client.permission.manageChannel(message.member, message.channel) && args[0] == 'channel') {
        sendTo = message.channel;
    }

    let includes = [
        {model: client.models.signup, as: 'signup', foreignKey: 'signupID'},
        {model: client.models.reserveItem, as: 'item', foreignKey: 'reserveItemID'},
    ];
    
    client.models.raidHardReserve.findAll({where: {RaidID: raid.id}, include: includes}).then((raidReserves) => {
        let reserves = [];
        for (key in raidReserves) {
            let raidReserve = raidReserves[key];
            if (raidReserve.signup) {
                reserves.push(raidReserve);
            }
        }

        if (args[0] != 'channel') sendTo.send('```diff\n+ Raid: \n- ' + message.channel.name + '```');

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
                    returnMessage = '\n```md\nHARD RESERVE LIST\n';
                    returnMessage += ''.padEnd(65, '-') + '\n';
                    returnMessage += 'Item'.padEnd(40) +  'Reserved At\n';
                    returnMessage += ''.padEnd(65, '-') + '\n';
                }
                returnMessage += reserve.item.name.padEnd(40) + moment(reserve.updatedAt).utcOffset(-240).format('h:mm A, L') + '\n';
                if (returnMessage.length > 1800) {
                    returnMessage += '```';
                    sendTo.send(returnMessage);    
                    returnMessage = '';
                }
            }
        });
        if (returnMessage.length) {
            returnMessage += '```';
            sendTo.send(returnMessage);    
        }
    });
};