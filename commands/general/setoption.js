const fs = require("fs");
const Discord = require("discord.js");


exports.run = (client, message, args) => {

	if (!message.isAdmin) {
		return false;
	}
	
	const optionName = args.shift();
	const optionValue = args.join(' ');
	
	if (!optionName || !optionValue) {
		return message.channel.send('Invalid parameters.  Correct usage is: +setoption optionName optionValue');
	}

	if (optionName == 'raidcategory') {
		client.models.settings.findOne({where: {guildID: message.guild.id}}).then((settings) => {
			let record = {
				raidcategory: optionValue,
				guildID: message.guild.id
			}
			if (settings) {
				client.models.settings.update(record, {where: {id: settings.id}}).then(() => {
					return client.messages.send(message.channel, 'Option saved.', 240);
				});
			} else {
				client.models.settings.create(record).then(() => {
					return client.messages.send(message.channel, 'Option saved.', 240);
				});
			}
		});
	} else {
		// Write to class json file
		let fileName = 'data/' + message.guild.id + '-options.json';
		let parsedList = {};
		if (fs.existsSync(fileName)) {
			currentList = fs.readFileSync(fileName, 'utf8');
			parsedList = JSON.parse(currentList);
		}
		parsedList[optionName] = optionValue;
		fs.writeFileSync(fileName, JSON.stringify(parsedList)); 

		return client.messages.send(message.channel, 'Option saved.', 240);
	}
};