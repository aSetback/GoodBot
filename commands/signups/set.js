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
		return client.messages.errorMessage(message.channel, className + ' is not a valid class.', 240);
	} else {
		let characterRole = await client.set.characterRole(client, message.guild, message.member, characterName, roleName);
		// Only execute this once character class has been set to prevent race conditions
		if (!characterRole) {
			return client.messages.errorMessage(message.channel, roleName + ' is not a valid role.  Valid roles are caster, dps, tank, healer.', 240);
		} else {
			// Completed successfully!
			return client.messages.send(message.channel, user + ' has been set as ' + className + '/' + roleName + '.', 240);
		}
	}
};