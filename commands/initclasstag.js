const Discord = require("discord.js");
const fs = require("fs");
const classMap = require("../classMap.json");

exports.run = (client, message, args) => {

	// Determine if the player sending the message is an officer
	let isOfficer = false;
	if (message.guild !== null) {
		let officerRole = message.guild.roles.find(role => role.name === "Officer" || role.name === "Staff");

		if (message.member.roles.has(officerRole.id)) {
			isOfficer = true;
		}
	}
	if (!isOfficer) {
		return false;
	}

	message.guild.createChannel('Class Tags', 'text')
		.then((channel) => {
			const main = client.emojis.find(emoji => emoji.name === "MAIN");
			const alt = client.emojis.find(emoji => emoji.name === "ALT");
			
			for (classKey in classMap) {
				let classData = classMap[classKey];
				const attachment = new Discord.Attachment('./img/' + classData.image, classData.image);
				const embed = new Discord.RichEmbed()
					.setTitle(classKey)
					.setColor(classData.color)
					.setDescription(`React with ${main} for 'main' or  ${alt} for 'alt' to be tagged.`)
					.attachFile(attachment)
					.setImage("attachment://" + classData.image)

				channel.send({embed}).then((message) => {
					message.react(main.id).then(() => {
						message.react(alt.id);
					});
				});
			}
		});

}