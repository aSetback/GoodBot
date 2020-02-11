const fs = require("fs");
const { Op } = require('sequelize');

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

	client.models.epgp.findAll({'where': {'class': args[0], 'guildID': parseInt(message.guild.id), 'createdAt': {[Op.gte]: oneMonthAgo}}}).then((classStandings) => {
		let standings = [];
		classStandings.forEach((standing) => {
			if (standings.indexOf(standing.player) < 0) {
				standings[standing.player] = standing;
			} else {
				let oldStanding = standings[standing.player] 
				if (oldStanding.createdAt > standing.createdAt) {
					standings[standing.player] = standing;
				}
			}
		});

		let arrayStandings = [];
		for (key in standings) {
			arrayStandings.push(standings[key]);
		}

		arrayStandings.sort((a, b) => {
			if (a.pr > b.pr) { return -1; }
			if (b.pr > a.pr) { return 1; }
			return 0;
		});
		
		let returnMessage = "";
		arrayStandings.forEach((classStanding) => {
			if (!returnMessage.length) {
				returnMessage += "```\n"
				returnMessage += "Name".padEnd(20) + "Class/Spec".padEnd(25) + "EP".padEnd(15) + "GP".padEnd(15) + "PR".padEnd(15) + "Last Seen" + "\n";
			}
			let spec = client.config.validSpecs.indexOf(classStanding.spec) >= 0 ? classStanding.spec + " " : "";
			let pr = classStanding.pr.toString().padEnd(15);
			pr = Math.round(pr * 100) / 100;
			pr = pr.toString();
			let lastSeen = classStanding.createdAt.toISOString().slice(0, 19).replace('T', ' ');

			returnMessage += classStanding.player.padEnd(20) + (spec + classStanding.class).padEnd(25) + classStanding.ep.toString().padEnd(15) + classStanding.gp.toString().padEnd(15) + pr.padEnd(15) + lastSeen + "\n";
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