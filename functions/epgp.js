const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	update: (client, channel) => {

		// Read our SavedVariables file
		epgpData = fs.readFileSync(client.config.epgpFile, 'utf8');
		// Split the lua file up into lines
		epgpLines = epgpData.split('\n');
		// Loop through the lines, find the one that has the standings.
		let standings = '';
		for (key in epgpLines) {
			let epgpLine = epgpLines[key];
			if (epgpLine.indexOf('shooty_filestandings') >= 0) {
				standings = epgpLine;
			}
		}
		
		// Split the string up into the three parts, removing the quote marks
		let pieces = standings.split('"');
		
		// Replace single quotes with double quotes, fix a trailing cmomma if there is one, and parse.
		let jsonStandings = JSON.parse(pieces[1].replace(/'/g, '"').replace("],]", "]]"));
		
		channel.fetchMessages({limit: 20})
		   .then(function(list){
				channel.bulkDelete(list);

				let fieldCount = 0;
				let embed = new Discord.RichEmbed()
					.setTitle("EPGP Standings")
					.setColor(0x02a64f);

				for (key in jsonStandings) {
					let standing = jsonStandings[key];
					let player = standing[0];
					let ep = standing[1];
					let gp = standing[2];
					embed.addField(player, (ep + " EP, " + gp + " GP, ") + (ep/gp).toFixed(2) + " PR");
					fieldCount++;
					if (fieldCount > 24) {
						channel.send(embed);
						fieldCount = 0;
						embed = new Discord.RichEmbed()
							.setColor(0x02a64f);					
					}
				}

				channel.send(embed);				
			});
	}
}