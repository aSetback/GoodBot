const fs = require("fs");
const Discord = require("discord.js");


exports.run = (client, message, args) => {

	message.delete().catch(O_o=>{}); 

	let profession = args.shift();
	profession = profession.charAt(0).toUpperCase() + profession.slice(1).toLowerCase();
	const link = args.shift().toLowerCase();
	for (key in args) {
		let word = args[key];
		args[key] = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	}
	const name = args.join(' ');
	const fileName = 'data/' + message.guild.id + '-recipes.json';
	
	let parsedList = {};
	if (fs.existsSync(fileName)) {
		currentList = fs.readFileSync(fileName, 'utf8');
		parsedList = JSON.parse(currentList);
	}

	parsedList[name] = {
		'name': name,
		'link': link,
		'profession': profession,
		'crafters': []
	};
	fs.writeFileSync(fileName, JSON.stringify(parsedList)); 

	message.channel.send('Added recipe "' + name + '" to ' + profession + '.');
	client.recipes.update(message);
};