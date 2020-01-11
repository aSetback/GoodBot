const fs = require("fs");
const Discord = require("discord.js");


exports.run = (client, message, args) => {

	message.delete().catch(O_o=>{}); 

	const crafter = args.shift().toLowerCase();
	const name = args.join(' ');
	const fileName = 'data/' + message.guild.id + '-recipes.json';
	
	let parsedList = {};
	if (fs.existsSync(fileName)) {
		currentList = fs.readFileSync(fileName, 'utf8');
		parsedList = JSON.parse(currentList);
	}
	if (parsedList[name]) {
		parsedList[name]['crafters'].push(crafter);
		fs.writeFileSync(fileName, JSON.stringify(parsedList)); 
		message.channel.send('Added crafter "' + crafter + '" to recipe "' + name + '".');
	} else {
		message.channel.send('Unable to find recipe: "' + name + '".');
	}
	client.recipes.update(message);
};