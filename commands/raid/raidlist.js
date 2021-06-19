const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');


exports.run = async (client, message, args) => {
    if (!message.isAdmin) {
        return false;
    }
    let start = moment(new Date()).format();
    let end = moment(new Date()).add(7, 'days').format();
    let raids = await client.models.raid.findAll({
        where: {
            date: {
                [Op.lte]: start,
                [Op.gte]: end
            }
        }
    });
    console.log(raids);
}