const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!message.isAdmin) {
		return false;
	}

	let guildID = message.guild.id;
	let joinMessage = args.join(' ');

	let record = {
		joinMessage: joinMessage,
		guildID: guildID
	}

	client.models.settings.findOne({where: {guildID: guildID}}).then((settings) => {
		if (settings) {
			client.models.settings.update(record, {where: {id: settings.id}}).then(() => {
				message.author.send('Discord welcome message updated: \n' + joinMessage);
			});
		} else {
			client.models.settings.create(record).then(() => {
				message.author.send('Discord welcome message created: \n' + joinMessage);
			});
		}
	});


};