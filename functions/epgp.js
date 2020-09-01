const parser = require('luaparse');
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
	},
	dndParse: (client, fileData) => {
		// remove comments
		fileData = fileData.replace(/(-- \[)(.*)(\])/g, '');

		// Parse lua to json
		let result = parser.parse(fileData);
		
		// Retrieve the relevant data
		let data = result.body[0].init[0];
		data = client.epgp.getFieldValue(data.fields, '"namespaces"');
		data = client.epgp.getFieldValue(data, '"log"');
		data = client.epgp.getFieldValue(data, '"profiles"');
		data = client.epgp.getFieldValue(data, '"Drunk N Disorderly"');
		data = client.epgp.getFieldValue(data, '"snapshot"');
		data = client.epgp.getFieldValue(data, '"roster_info"');
		
		// Loop through results to put it in a friendly json format for display
		let epgp = [];
		for (key in data) {
			let entry = {
				'player': data[key].value.fields[0].value.raw.replace(/\"/g, ''),
				'class': data[key].value.fields[1].value.raw.replace(/\"/g, ''),
				'ep': parseInt(data[key].value.fields[2].value.raw.replace(/\"/g, '').split(',')[0]),
				'gp': parseInt(data[key].value.fields[2].value.raw.replace(/\"/g, '').split(',')[1])
			}
			entry.ep = isNaN(entry.ep) ? 0 : entry.ep;
			entry.gp = isNaN(entry.gp) ? 0 : entry.gp;
			if (entry.gp < 200) { entry.gp = 200; }
			entry.class = client.general.ucfirst(entry.class);
			if (entry.class == 'Deathknight') { entry.class = 'Death Knight'; }
			entry.pr = entry.gp == 0 ? 0 : (entry.ep / entry.gp).toPrecision(4);
			if (entry.pr != 0) {
				epgp.push(entry);
			}
		}
		epgp.sort((a, b) => {
			return parseFloat(a.pr) > parseFloat(b.pr) ? -1 : 1;
		});
		return epgp;
	},
	getFieldValue: (obj, type) => {
		for (key in obj) {
			if (obj[key].key.raw == type) {
				let returnData = obj[key];
				if (returnData.hasOwnProperty('value')) {
					returnData = returnData.value;
				}
				if (returnData.hasOwnProperty('fields')) {
					returnData = returnData.fields;
				}
				return returnData;
			}        
		}
	},
	clearChannel: async (displayChannel) => {
		let messages = await displayChannel.fetchMessages();
		try {
			displayChannel.bulkDelete(messages);
		} catch(error) {
			messages.array().forEach((message) => {
				messages.delete();
			});
		}
	},
	display: (displayChannel, jsonData) => {
		if (!displayChannel) { return; }
		let returnMsg = '';

		for (key in jsonData) {
			if (returnMsg.length > 1900) {
				returnMsg += '```';
				displayChannel.send(returnMsg);
				returnMsg = '';
			}

			if (!returnMsg) {
				returnMsg = '```md\n';
				returnMsg += 'Player'.padEnd(18);
				returnMsg += 'Class'.padEnd(18);
				returnMsg += 'EP'.padEnd(10);
				returnMsg += 'GP'.padEnd(10);
				returnMsg += 'PR'.padEnd(10) + '\n';	
				returnMsg += ''.padEnd(68, '-') + '\n';
			}

			let standing = jsonData[key];
			returnMsg += standing.player.padEnd(18);
			returnMsg += standing.class.padEnd(18);
			returnMsg += standing.ep.toString().padEnd(10);
			returnMsg += standing.gp.toString().padEnd(10);
			returnMsg += standing.pr.toString().padEnd(10) + '\n';
		}
		returnMsg += '```';
		displayChannel.send(returnMsg);
	}
}