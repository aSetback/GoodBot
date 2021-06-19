const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');


exports.run = async (client, message, args) => {
    if (!message.isAdmin) {
        return false;
    }
    let start = moment(new Date()).format();
    let end = moment(new Date()).add(7, 'days').format();
    let age = moment(new Date()).subtract(60, 'days').format();
    let raids = await client.models.raid.findAll({
        where: {
            date: {
                [Op.gte]: start,
                [Op.lte]: end
            },
            createdAt: {
                [Op.gte]: age
            },
            guildID: message.guild.id
        },
        order: [
            ['faction', 'ASC'],
            ['raid', 'ASC'],
            ['date', 'ASC'],
            ['time', 'ASC']
        ]
    });
    let returnMessage = '';
    raids.forEach((raid) => {
        returnMessage += raid.date + ' @ ' + raid.time + ' - <#' + raid.channelID + '> (' + raid.raid + ', ' + raid.faction + ')' + '\n';
    });
    message.channel.send(returnMessage);
}