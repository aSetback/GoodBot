const fs = require("fs");
const Discord = require("discord.js");


exports.run = (client, message, args) => {
	message.delete().catch(O_o=>{}); 
	if (!args[0]) {
		return false;
    }
    
	let fileName = 'data/iam.json';

    let parsedList = {};
	if (fs.existsSync(fileName)) {
		currentList = fs.readFileSync(fileName, 'utf8');
		parsedList = JSON.parse(currentList);
	}

    if (!['add', 'remove'].includes(args[0])) {
        if (args[0] == 'not' && args[1]) {

            message.author.send('Removed role: ' + args[1]);
        } else {

            message.author.send('Added role: ' + args[0]);
        }
        return true;
    } 
    
    // Only server admins
	if (!message.serverAdmin || !message.guild) {
		return false;
	}
    
    let role = args[1];
    let guildId = message.guild.id;
    if (!parsedList[guildId]) {
        parsedList[guildId] = [];
    }

    if (args[0] == 'add') {
        parsedList[guildId].push(role);
    } else if (args[0] == 'remove') {
        let removeIndex = parsedList[guildId].indexOf(role);
        if (removeIndex > -1) {
            parsedList[guildId].splice(removeIndex, 1);
            message.author.send('Removed role: ' + args[1]);
        }
    } 
	fs.writeFileSync(fileName, JSON.stringify(parsedList)); 


};