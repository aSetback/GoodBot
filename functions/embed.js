const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	update: (message, raid) => {
	let raidArray = raid.split(/-/g);
	let raidMonth = raidArray[2];
	let raidDay = raidArray[3];
	let raidDate = new Date(Date.parse(raidMonth + " " + raidDay));
	let dateString = raidDate.toLocaleString('en-us', { month: 'long' }) + " " + raidDate.getUTCDate();
	let raidName = raidArray[0].replace(/_/g, ' ');
	let raidParts = raidName.toLowerCase().split(' ');
	if (raidParts[0] == 'mc') {
		raidName = 'Molten Core';
	} else if (raidParts[0] == 'ony') {
		raidName = 'Onyxia';
	} else {
		raidName = raidName.charAt(0).toUpperCase() + raidName.slice(1).toLowerCase();
	}
	if (raidParts[1]) {
		let groupName = raidParts[1];
		groupName = groupName.charAt(0).toUpperCase() + groupName.slice(1).toLowerCase();
		raidName += ' (' + groupName + ')';
	}
	message.channel.fetchPinnedMessages()
		.then(function(list){
			pinnedMsg = list.last();
			if (!pinnedMsg) { return false; }
			currentContent = pinnedMsg.content;
			const raid = message.channel.name;
			const fileName = './signups/' + message.guild.id + '-' + raid + '.json';
			let parsedLineup = {};
			if (fs.existsSync(fileName)) {
				currentLineup = fs.readFileSync(fileName, 'utf8');
				parsedLineup = JSON.parse(currentLineup);
			}
			
			let yesArray = [];
			let maybeArray = [];
			let noArray = [];
			
			for (player in parsedLineup) {
				if (parsedLineup[player] === 'yes') {
					yesArray.push(player);
				} else if (parsedLineup[player] === 'maybe') {
					maybeArray.push(player);
				} else if (parsedLineup[player] === 'no') {
					noArray.push(player);
				}
			}
			
			let embed = new Discord.RichEmbed()
				.setTitle("Raid Signups for " + raidName + ", " + dateString)
				.setColor(0x02a64f);

			if (yesArray.length) {  
				embed.addField('Yes (' + yesArray.length + ')', yesArray.join(', '))
			} else {
				embed.addField('Yes', '-');
			}

			if (maybeArray.length) {  
				embed.addField('Maybe (' + maybeArray.length + ')', maybeArray.join(', '))
			} else {
				embed.addField('Maybe', '-');
			}

			if (noArray.length) {  
				embed.addField('No (' + noArray.length + ')', noArray.join(', '));
			} else {
				embed.addField('No', '-');
			}

			pinnedMsg.edit(currentContent, embed);
		});		
	}
}
