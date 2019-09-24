const Discord = require("discord.js");
const fs = require("fs");
const classMap = require("../classMap.json");

exports.run = (client, message, args) => {

	if (!message.isAdmin) {
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
						setTimeout(function() {
							message.react(alt.id);
						}, 60000);
					});
				});
			}
		});

}