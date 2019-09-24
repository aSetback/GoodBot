const fs = require("fs");
const Discord = require("discord.js");


exports.run = (client, message, args) => {

	message.delete().catch(O_o=>{}); 

	const user = args[0];
	const playerName = user.charAt(0).toUpperCase() + user.slice(1).toLowerCase();

	const role = args[1];
	const roleName = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

	const fileName = 'data/roles.json';
	
	let parsedList = {};
	if (fs.existsSync(fileName)) {
		currentList = fs.readFileSync(fileName, 'utf8');
		parsedList = JSON.parse(currentList);
	}
	
	parsedList[playerName] = roleName;
	fs.writeFileSync(fileName, JSON.stringify(parsedList)); 

	message.channel.send('Updated ' +  playerName + ' as ' + roleName + '.');

};