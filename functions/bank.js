const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	update: (client, guild) => {
		console.log('Bank Update')

		// Read our SavedVariables file
		epgpData = fs.readFileSync(client.config.bankFile, 'utf8');

		// Split the lua file up into lines
		bankLines = epgpData.split('\n');

		let channel = guild.channels.find(channel => channel.name === "bank");
		if (!channel) {
			console.log('Bank channel does not exist.');
			return false;
		}
		
		// Loop through the lines, find the ones that belong to GoodBankInventory.
		let bankContents = {};
		let parseLine = false;
		for (key in bankLines) {
			let bankLine = bankLines[key];
			if (bankLine[0] == "}") {
				parseLine = false;
			}
			if (parseLine) {
				bankLine = bankLine.substr(0, bankLine.length - 3);
				// Split up the first 3 double quotes to get bank name
				bankLine = bankLine.substr(bankLine.indexOf('"') + 1);
				let bankName = bankLine.substr(0, bankLine.indexOf('"'));

				// Move up two more double quotes to get the json string ..
				bankLine = bankLine.substr(bankLine.indexOf('"') + 1);
				bankLine = bankLine.substr(bankLine.indexOf('"') + 1);

				// Unescape the double quotes
				bankLine = bankLine.replace(/\\"/g, '"');
				try {
					bankLine = JSON.parse(bankLine);
				} catch (e) {
					console.log('Invalid json content.');
					return false;
				}
				bankLine.sort(function(a, b) {
					if (a.name > b.name) return 1;
					else if (a.name < b.name) return -1;
					return 0;
				});

				bankContents[bankName] = bankLine;
			}
			if (bankLine.indexOf('GoodBankInventory = ') >= 0) {
				parseLine = true;
			}
		}

		channel.fetchMessages({limit: 20})
		   .then(function(list){
				channel.bulkDelete(list);

				for (bankName in bankContents) {
					let fieldCount = 0;
					let embed = new Discord.RichEmbed()
						.setTitle(bankName)
						.setColor(0x02a64f);

					for (itemId in bankContents[bankName]) {
						let itemInfo = bankContents[bankName][itemId]
						embed.addField(itemInfo.qty + ' x [' + itemInfo.name + ']', 'https://classic.wowhead.com/item=' + itemInfo.id);
						fieldCount++;
						if (fieldCount > 24) {
							channel.send(embed);
							fieldCount = 0;
							embed = new Discord.RichEmbed()
								.setColor(0x02a64f);					
						}
					}

					channel.send(embed);				
				}
			});
	}
}
