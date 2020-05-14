const moment = require('moment');

exports.run = async function(client, message, args) {
	let raid = await client.signups.getRaid(client, message.channel);
    if (!raid.softreserve) {
        return message.author.send("Soft reserve is not currently enabled for this raid.");
    }

    let sendTo = message.author;
	if (client.permission.manageChannel(message.member, message.channel) && args[0] == 'channel') {
        sendTo = message.channel;
    }

    let includes = [
        {model: client.models.signup, as: 'signup', foreignKey: 'signupID'},
        {model: client.models.reserveItem, as: 'item', foreignKey: 'reserveItemID'},
    ];
    
    client.models.raidReserve.findAll({where: {RaidID: raid.id}, include: includes}).then((raidReserves) => {
        let reserves = [];
        for (key in raidReserves) {
            let raidReserve = raidReserves[key];
            if (raidReserve.signup) {
                reserves.push(raidReserve);
            }
        }

        sendTo.send('```diff\n+ Raid: \n- ' + message.channel.name + '```');
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
                    returnMessage += 'Player'.padEnd(20) + 'Item'.padEnd(40) +  'Reserved At\n';
                    returnMessage += ''.padEnd(85, '-') + '\n';
                }
                returnMessage += reserve.signup.player.padEnd(20) + reserve.item.name.padEnd(40) + moment(reserve.updatedAt).utcOffset(-240).format('h:mm A, L') + '\n';
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