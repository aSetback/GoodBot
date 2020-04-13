const fs = require("fs");
const Discord = require("discord.js");


exports.run = async function(client, message, args) {

	if (!message.guild) {
		return false;
	}

	if (!args[1] || !args[2]) {
		return message.channel.send("Correct usage is:\n```+set Setback mage caster```");
	}

	const classArg = args[1];
	const roleArg = args[2]
	const className = classArg.charAt(0).toUpperCase() + classArg.slice(1).toLowerCase();
	const roleName = roleArg.charAt(0).toUpperCase() + roleArg.slice(1).toLowerCase();
	const user = args[0] ? args[0] : message.member.displayName;
	const characterName = user.charAt(0).toUpperCase() + user.slice(1).toLowerCase();

	let characterClass = await client.set.characterClass(client, message.guild, message.member, characterName, className);
	if (!characterClass) {
		return message.channel.send(className + ' is not a valid class.');
	} else {
		let characterRole = await client.set.characterRole(client, message.guild, message.member, characterName, roleName);
		// Only execute this once character class has been set to prevent race conditions
		if (!characterRole) {
			return message.channel.send(roleName + ' is not a valid role.');
		} else {
			// Completed successfully!
			return message.channel.send(characterName + ' has been set as ' + className + '/' + roleName + '.');
		}
	}
};