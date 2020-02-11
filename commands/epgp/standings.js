const fs = require("fs");

exports.run = (client, message, args) => {
	message.delete();

	if (!args[0]) {
		return message.channel.send('Please provide one or more classes for a standings look-up.');
	}
	args.forEach((argClass, key) => {
		args[key] = argClass.charAt(0).toUpperCase() + argClass.slice(1).toLowerCase();
	});

	let oneMonthAgo = new Date();
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
	oneMonthAgo = oneMonthAgo.toISOString().slice(0, 19).replace('T', ' ');

	client.models.epgp.findAll({'where': {'class': args[0], 'guildID': parseInt(message.guild.id)}, 'group': ['guildID', 'player'], 'order': [['createdAt', 'DESC']]}).then((classStandings) => {
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
			let pr = classStanding.pr.toString().padEnd(15);
			pr = Math.round(pr * 100) / 100;
			pr = pr.toString();

			returnMessage += classStanding.player.padEnd(20) + (spec + classStanding.class).padEnd(25) + classStanding.ep.toString().padEnd(15) + classStanding.gp.toString().padEnd(15) + pr + "\n";
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