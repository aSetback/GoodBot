const fs = require("fs");
const Discord = require("discord.js");


exports.run = (client, message, args) => {

	message.delete().catch(O_o=>{}); 

	const optionName = args.shift();
	const optionValue = args.join(' ');
	
	if (!optionName || !optionValue) {
		return message.channel.send('Invalid parameters.  Correct usage is: +setoption optionName optionValue');
	}

	// Write to class json file
	let fileName = 'data/' + message.guild.id + '-options.json';
	let parsedList = {};
	if (fs.existsSync(fileName)) {
		currentList = fs.readFileSync(fileName, 'utf8');
		parsedList = JSON.parse(currentList);
	}
	parsedList[optionName] = optionValue;
	fs.writeFileSync(fileName, JSON.stringify(parsedList)); 

	message.channel.send('Option Saved.');

};