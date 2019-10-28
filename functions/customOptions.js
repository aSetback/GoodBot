const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	get: (guild, optionName) => {

		let fileName = 'data/' + guild.id + '-options.json';
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
