const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	update: (client, guild, content) => {
		// Split the lua file up into lines
		epgpLines = content.split('\n');

		let channel = guild.channels.find(channel => channel.name === "standings");
		if (!channel) {
			console.log('EPGP channel does not exist for ' + guild.name);
			return false;
		}
		
		// Loop through the lines, find the one that has the standings.
		let standings = '';
		for (key in epgpLines) {
			let epgpLine = epgpLines[key];
			if (epgpLine.indexOf('GoodEPGPStandings = ') >= 0) {
				standings = epgpLine.replace(/\\"/g, '"');
			}
		}

		standings = standings.substr(21, standings.length - 23);
		try {
			standings = JSON.parse(standings);
		} catch (e) {
			console.log('Invalid json content.');
			return false;
		}

		// Convert to mysql time
		let fileTime = new Date();
		let createdAt = fileTime.toISOString().slice(0, 19).replace('T', ' ');

		standings.forEach((player) => {
			let record = {
				'player': player.player,
				'ep': parseFloat(player.ep),
				'gp': parseFloat(player.gp),
				'pr': parseFloat(player.pr),
				'class': player.class,
				'guildID': guild.id,
				'createdAt': createdAt
			};
			client.models.epgp.create(record);
		});

		channel.fetchMessages({limit: 20})
		   .then(function(list){
				channel.bulkDelete(list, true);

				let returnMsg = '';

				for (key in standings) {
					if (returnMsg.length > 1900) {
						returnMsg += '```';
						channel.send(returnMsg);
						returnMsg = '';
					}

					if (!returnMsg) {
						returnMsg = '```md\n';
						returnMsg += 'Player'.padEnd(18);
						returnMsg += 'Class'.padEnd(20);
						returnMsg += 'EP'.padEnd(10);
						returnMsg += 'GP'.padEnd(10);
						returnMsg += 'PR'.padEnd(10) + '\n';	
						returnMsg += ''.padEnd(68, '-') + '\n';
					}

					let standing = standings[key];
					let spec = standing.spec;
					if (client.config.validSpecs.indexOf(spec) < 0) {
						spec = '';
					} else {
						spec += ' ';
					}
					
					returnMsg += standing.player.padEnd(18);
					returnMsg += (spec + standing.class).padEnd(20);
					returnMsg += standing.ep.toString().padEnd(10);
					returnMsg += standing.gp.toString().padEnd(10);
					returnMsg += standing.pr.toString().padEnd(10) + '\n';
				}
				returnMsg += '```';
				channel.send(returnMsg);
			});
	}
}