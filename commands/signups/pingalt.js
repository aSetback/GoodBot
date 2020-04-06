const fs = require("fs");
const Discord = require("discord.js");


exports.run = (client, message, args) => {

	const altName = args.shift();
	const mainName = args.shift();
	
	if (!altName || !mainName) {
		return message.channel.send('Invalid parameters.  Correct usage is: +pingalt altName mainName');
	}

	// Write to class json file
	let fileName = 'data/' + message.guild.id + '-pingalts.json';
	let parsedList = {};
	if (fs.existsSync(fileName)) {
		currentList = fs.readFileSync(fileName, 'utf8');
		parsedList = JSON.parse(currentList);
	}
	parsedList[altName] = mainName;
	fs.writeFileSync(fileName, JSON.stringify(parsedList)); 

	message.channel.send('GoodBot will now ping ' + mainName + ' instead of ' + altName + '.');

};