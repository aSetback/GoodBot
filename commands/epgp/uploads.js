const fs = require("fs");
const { Op } = require('sequelize');

exports.run = (client, message, args) => {
    message.delete();
    
    if (!args[0]) {
        client.models.epgp.findAll({'where': {'guildID': parseInt(message.guild.id)}, 'group': ['createdAt'], 'order': [['createdAt', 'DESC']]}).then((listings) => {
            let uploadCount = 0;
            let returnMsg = '';
            listings.forEach((listing) => {
                uploadCount ++;
                returnMsg += uploadCount.toString().padEnd(4) + ' ' + listing.createdAt.toISOString() + '\n';
                if (returnMsg.length > 1500) {
                    message.channel.send('```\n' + returnMsg + '```');
                }
            });
            message.channel.send('```\n' + returnMsg + '```');
        });
    } else {
        let dateTime = new Date(args.join(' '));
        client.models.epgp.findAll({'where': {'guildID': parseInt(message.guild.id), 'createdAt': dateTime}}).then((players) => {
            returnMsg = '[';
            players.forEach((player) => {
                returnMsg += '{"player":"' + player.player + '", "ep":"' + player.ep + '", "gp":"' + player.gp + '"},';
                if (returnMsg.length > 1500) {
                    message.channel.send('```\n' + returnMsg + '```');
                    returnMsg = '';
                }

            });
            returnMsg = returnMsg.slice(0, -1);
            returnMsg += ']';
            message.channel.send('```\n' + returnMsg + '```');
        });
    }
}