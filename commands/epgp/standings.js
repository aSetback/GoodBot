const fs = require("fs");

exports.run = (client, message, args) => {
	message.delete();

	if (!args[0]) {
		return message.channel.send('Please provide one or more classes for a standings look-up.');
	}
	args.forEach((argClass, key) => {
		args[key] = argClass.charAt(0).toUpperCase() + argClass.slice(1).toLowerCase();
	});

	client.models.epgp.findAll({'where': {'class': args[0], 'guildID': parseInt(message.guild.id)}, 'group': ['guildID', 'player'], 'order': [['pr', 'DESC']]}).then((classStandings) => {
		let returnMessage = "";
		classStandings.sort((a, b) => {
			if (a.pr > b.pr) { return -1; }
			if (b.pr > a.pr) { return 1; }
			return 0;
		});
		classStandings.forEach((classStanding) => {
			if (!returnMessage.length) {
				returnMessage += "```\n"
				returnMessage += "Name".padEnd(20) + "Class/Spec".padEnd(25) + "EP".padEnd(15) + "GP".padEnd(15) + "PR".padEnd(15) + "\n";
			}
			let spec = client.config.validSpecs.indexOf(classStanding.spec) >= 0 ? classStanding.spec + " " : "";
			returnMessage += classStanding.player.padEnd(20) + (spec + classStanding.class).padEnd(25) + classStanding.ep.toString().padEnd(15) + classStanding.gp.toString().padEnd(15) + classStanding.pr.toString().padEnd(15) + "\n";
			if (returnMessage.length > 1500) {
				returnMessage += '```';
				message.author.send(returnMessage);
				returnMessage = '';
			}
		});
		if (returnMessage.length) {
			returnMessage += "```";
			message.author.send(returnMessage);
		}
	});
}