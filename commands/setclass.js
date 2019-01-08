const fs = require("fs");
const Discord = require("discord.js");


exports.run = (client, message, args) => {

	message.delete().catch(O_o=>{}); 

	const wowClass = args[0];
	const className = wowClass.charAt(0).toUpperCase() + wowClass.slice(1).toLowerCase();
	const user = args[1] ? args[1] : message.member.displayName;
	const playerName = user.charAt(0).toUpperCase() + user.slice(1).toLowerCase();

	const fileName = 'data/class.json';
	
	let parsedList = {};
	if (fs.existsSync(fileName)) {
		currentList = fs.readFileSync(fileName, 'utf8');
		parsedList = JSON.parse(currentList);
	}
	
	parsedList[playerName] = className;
	fs.writeFileSync(fileName, JSON.stringify(parsedList)); 

	message.channel.send('Updated ' +  playerName + ' as ' + className + '.');

};