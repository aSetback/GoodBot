const fs = require("fs");
const Discord = require("discord.js");


exports.run = (client, message, args) => {

	if (!message.guild) {
		return false;
	}
	
	message.delete().catch(O_o=>{}); 
	if (!args[1] || !args[2]) {
		return message.channel.send("Correct usage is:\n```+set Setback mage caster```");
	}

	const classArg = args[1];
	const roleArg = args[2]
	const className = classArg.charAt(0).toUpperCase() + classArg.slice(1).toLowerCase();
	const roleName = roleArg.charAt(0).toUpperCase() + roleArg.slice(1).toLowerCase();
	const user = args[0] ? args[0] : message.member.displayName;
	const playerName = user.charAt(0).toUpperCase() + user.slice(1).toLowerCase();

	if (!client.set.playerClass(client, message.guild, message.member, playerName, className)) {
		return message.channel.send(className + ' is not a valid class assignment.');
	}

	if (!client.set.playerRole(client, message.guild, message.member, playerName, roleName)) {
		return message.channel.send(className + ' is not a valid class assignment.');
	}

	return message.channel.send('Updated ' +  playerName + ' as ' + className + '/' + roleName + '.');
};