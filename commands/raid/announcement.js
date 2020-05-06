const Discord = require("discord.js");
const { Op } = require('sequelize');

exports.run = async function(client, message, args) {
	if (!message.isAdmin) {
		return false;
	}
    let oneWeek = new Date();
    oneWeek.setDate(oneWeek.getDate() + 7);
    client.models.raid.findAll({where: {date: {[Op.between]: [new Date(), oneWeek]}, guildID: message.guild.id}}).then((raids) => {
        let sortedRaids = [];
        let validRaids = ['MC', 'BWL', 'ZG', 'ONY', 'AQ20', 'AQ40', 'NAXX'];

        raids.forEach((raid) => {
            if (raid.faction && validRaids.includes(raid.raid)) {
                if (!sortedRaids[raid.faction]) {
                    sortedRaids[raid.faction] = [];
                }
                if (!sortedRaids[raid.faction][raid.raid]) {
                    sortedRaids[raid.faction][raid.raid] = [];
                }
                if (!sortedRaids[raid.faction][raid.raid][raid.date]) {
                    sortedRaids[raid.faction][raid.raid][raid.date] = [];
                }
                sortedRaids[raid.faction][raid.raid][raid.date].push(message.guild.channels.find(c => c.id == raid.channelID));
            }
        });
        let announcement = '-\n__**Upcoming Raids**__\n';
        for (faction in sortedRaids) {
            announcement += '`' + client.general.ucfirst(faction) + '`\n';
            for (raid in sortedRaids[faction]) {
                announcement += '`  ' + raid.toUpperCase() + '`\n';
                for (date in sortedRaids[faction][raid]) {
                    announcement += '`    ' + date + ': `' + sortedRaids[faction][raid][date].join(', ') + '\n';
                    
                }
            }
        }
        message.channel.send(announcement);
    });

};