const fs = require("fs");
const Discord = require("discord.js");


exports.run = async function(client, message, args) {

	if (!message.guild) {
		return false;
	}

	if (!args[1] || !args[2]) {
		return client.messages.errorMessage(message.channel, "Correct usage is:\n```+set PlayerName mage caster```", 60);
	}

	const characterName = client.general.ucfirst(args[0]);
	const className = client.general.ucfirst(args[1]);
	const roleName = client.general.ucfirst(args[2]);

	let characterClass = await client.set.characterClass(client, message.guild, message.member, characterName, className);
	if (!characterClass) {
		return client.messages.errorMessage(message.channel, className + ' is not a valid class.', 240);
	}
	
	let characterRole = await client.set.characterRole(client, message.guild, message.member, characterName, roleName);
	if (!characterRole) {
		return client.messages.errorMessage(message.channel, roleName + ' is not a valid role.  Valid roles are caster, dps, tank, healer.', 240);
	}
	
	// Completed successfully!
	return client.messages.send(message.channel, characterName + ' has been set as ' + className + '/' + roleName + '.', 240);
};