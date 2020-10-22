const Discord = require("discord.js");

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.run = async function(client, message, args) {
	let raid = await client.raid.get(client, message.channel);
	if (!raid) {
		return message.author.send('This command is only usable in raid channels.');
	}

	let whereCondition = {raid: raid.raid};
	if (raid.raid.indexOf('+') > -1) {
		raidParts = raid.raid.split('+');
		let raidSections = [];
		raidParts.forEach((part) => {
			raidSections.push({ raid: part});
		});
	
		whereCondition = {
			[Op.or]: raidSections
		};
	}
	client.models.reserveItem.findAll({where: whereCondition, order: ['name']}).then((reserveItem) => {

		let icon = 'http://softball.setback.me/goodbot/icons/' + raid.raid + '.png';
		let returnMessage = '';
		let fields = 0;
		let embed = new Discord.RichEmbed()
		.setTitle("Reservable items for " + raid.raid.toUpperCase())
		.setColor('#b00b00')
		.setThumbnail(icon);
		reserveItem.forEach((item) => {
            returnMessage += '[' + item.name + '](https://classic.wowhead.com/item=' + item.itemID + ')\n';
            if (returnMessage.length > 900) {
                embed.addField('Reservable Items', returnMessage);    
				fields ++;
				returnMessage = '';
			}
			if (fields == 5) {
				message.author.send(embed);    
				fields = 0;
				embed = new Discord.RichEmbed()
				.setTitle("Reservable items for " + raid.raid.toUpperCase())
				.setColor('#b00b00')
				.setThumbnail(icon);
			}
        });
        if (returnMessage.length) {
			embed.addField('Reservable Items', returnMessage);    
            message.author.send(embed);    
        }
	
	});
};