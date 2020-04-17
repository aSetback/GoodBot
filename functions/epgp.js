const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	update: (client, guild, file) => {
		// Read our SavedVariables file
		epgpData = fs.readFileSync(file, 'utf8');

		// Split the lua file up into lines
		epgpLines = epgpData.split('\n');

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
	},
	parseFile: (client, file) => {
		let fileParts = file.split('-');
		let fileTime = new Date();
		let standings = fs.readFileSync(file, 'utf8');
		let jsonParse = '';
		try {
			jsonParse = JSON.parse(standings);
		} catch (e) {
			console.log('Invalid json content.');
			return false;
		}
		let month = parseInt(fileParts[2]) - 1;
		fileTime.setMonth(parseInt(fileParts[2]) - 1);
		fileTime.setDate(fileParts[3]);
		fileTime.setFullYear(fileParts[4]);
		fileTime.setHours(fileParts[5]);
		fileTime.setMinutes(fileParts[6]);
		fileTime.setSeconds(fileParts[7].replace('.json', ''));

		// Convert to mysql time
		let createdAt = fileTime.toISOString().slice(0, 19).replace('T', ' ');

		let guildID = 0;
		if (!fileParts[8]) {
			if (standings.indexOf('Taunt') != -1) {
				guildID = 581817176915181568;
			}
			if (standings.indexOf('Memerlord') != -1) {
				guildID = 379733719952654337;
			}
		} else {
			guildID = parseInt(fileParts[8].split('.')[0]);
		}
		if (!guildID) {
			console.log('Unable to import file: ' + file);
			return false;
		}

		jsonParse.forEach((player) => {
			let record = {
				'player': player.player,
				'ep': parseFloat(player.ep),
				'gp': parseFloat(player.gp),
				'pr': parseFloat(player.pr),
				'class': player.class,
				'guildID': guildID,
				'createdAt': createdAt
			};
			client.models.epgp.create(record);
		});
	}
}