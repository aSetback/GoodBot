const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	get: async (client, guild, optionName) => {
		let guildID = guild;
		if (guild.id) {
			guildID = guild.id;
		}

		let settings = await client.models.settings.findOne({where: {guildID: guildID}});
		if (settings && settings[optionName]) {
			return settings[optionName];
		} else {
			let fileName = 'data/' + guildID + '-options.json';
			let parsedList = {};
			if (fs.existsSync(fileName)) {
				currentList = fs.readFileSync(fileName, 'utf8');
				parsedList = JSON.parse(currentList);
			}
			if (parsedList[optionName]) {
				return parsedList[optionName];
			} 
			return false;
		}

	}
}
