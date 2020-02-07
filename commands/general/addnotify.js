const fs = require("fs");
const Discord = require("discord.js");


exports.run = (client, message, args) => {

	if (!message.guild) {
		return false;
	}
	
	message.delete().catch(O_o=>{}); 
	if (!args[0]) {
		return false;
	}

	// Write to notify json file
	let fileName = 'data/notify.json';
	let parsedList = [];
	if (fs.existsSync(fileName)) {
        currentList = fs.readFileSync(fileName);
		parsedList = JSON.parse(currentList);
	}
    parsedList.push(args[0]);
    fs.writeFileSync(fileName, JSON.stringify(parsedList)); 

    message.channel.send('Notify number added.');

};