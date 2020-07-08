const moment = require('moment');

exports.run = async function(client, message, args) {
    let player = args.shift();
    let guildID = message.guild.id;
    if (!player) {
        return client.messages.errorMessage(message.channel, "Player name is required.", 240);
    }

    let includes = [
        {model: client.models.raid, as: 'raid', foreignKey: 'raidID'},
        {model: client.models.raidReserve, as: 'reserve', foreignKey: 'signupID', include: {
            model: client.models.reserveItem, as: 'item', foreignKey: 'raidReserveID'
        }},
    ];
    let timesReserved = [];
    client.models.signup.findAll({ where: {guildID: guildID, player: player}, include: includes}).then((signups) => {
        let returnMessage = '```md\n';
        returnMessage += 'Item Name'.padEnd(50) + 'Date' + '\n';
        returnMessage += ''.padEnd(75, '=') + '\n'; 
        signups.forEach((signup) => {
            if (signup.reserve && signup.reserve.item) {
                returnMessage += signup.reserve.item.name.padEnd(50) + signup.raid.date + '\n';
                if (timesReserved[signup.reserve.item.id]) {
                    timesReserved[signup.reserve.item.id].count++;
                } else {
                    timesReserved[signup.reserve.item.id] = {count: 1, name: signup.reserve.item.name};
                }
            }
        });
        returnMessage += '```';
        message.author.send(returnMessage)
        
        returnMessage = '```md\n';
        returnMessage += 'Item Name'.padEnd(50) + 'Times Reserved' + '\n';
        returnMessage += ''.padEnd(75, '=') + '\n'; 
        timesReserved.forEach((item) => {
            returnMessage += item.name.padEnd(50) + item.count + '\n';
        });
        returnMessage += '```';
        message.author.send(returnMessage)
    });

};