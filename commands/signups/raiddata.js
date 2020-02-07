const fs = require("fs");
const Discord = require("discord.js");


exports.run = (client, message, args) => {
	if (!message.guild) {
		return false;
	}
	message.delete().catch(O_o=>{}); 

	if (!args[0] || !args[1]) {
		return false;
	}

	const key = args.shift().toLowerCase();
	const value = args.join(' ');

	// Write to class json file
	const fileName = './signups/' + message.guild.id + '-' + message.channel.name + '.json';
	let parsedFile = {};
	if (fs.existsSync(fileName)) {
		file = fs.readFileSync(fileName, 'utf8');
		parsedFile = JSON.parse(file);
	}
	if (!parsedFile.data) {
		parsedFile.data = {};
	}
	parsedFile.data[key] = value;
	fs.writeFileSync(fileName, JSON.stringify(parsedFile)); 

	message.author.send('Updated ' +  key + ' to "' + value + '" for ' + message.channel.name + '.');
	client.embed.update(message, message.channel.name);
};