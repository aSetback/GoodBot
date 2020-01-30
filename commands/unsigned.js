const fs = require("fs");

exports.run = (client, message, args) => {
	message.delete().catch(O_o=>{}); 

	var daysAgo = args[0] ? args[0] : 7;

	const raid = message.channel.name;

	// Attempt to parse out raid name & date
	const nameParts = raid.split('-');

	let raidName = nameParts[0];
	const raidMonth = nameParts[2];
	const raidDay = nameParts[3];
	if (args[1]) {
		raidName = args[1];
	}

	var currentDay = new Date('2019/' + raidMonth + '/' + raidDay);
	var lastWeek = new Date(currentDay.getTime() - daysAgo * 24 * 60 * 60 * 1000);
	var lastRaidDay = lastWeek.getDate().toString().slice(-2)
	var lastRaidMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][lastWeek.getMonth()].toLowerCase();
	var lastRaidChannel = raidName + '-signups-' + lastRaidMonth + '-' + lastRaidDay;

	const lastFileName = './signups/' + message.guild.id + '-' + lastRaidChannel + '.json';
	var parsedLastLineup = [];
	if (fs.existsSync(lastFileName)) {
		lastLineup = fs.readFileSync(lastFileName, 'utf8');
		parsedLastLineup = JSON.parse(lastLineup);
	} else {
		return message.channel.send("Error: Unable to find raid: " + lastRaidChannel);
	}

	const fileName = './signups/' + message.guild.id + '-' + raid + '.json';
	var parsedLineup = [];
	if (fs.existsSync(fileName)) {
		lineup = fs.readFileSync(fileName, 'utf8');
		parsedLineup = JSON.parse(lineup);
	} else {
		return message.channel.send("Error: Not a valid raid channel.");
	}

	// Check if a player is found in both line-ups.
	for (player in parsedLastLineup) {
		if (parsedLastLineup[player] == "no") {
			delete parsedLastLineup[player];
		} else {
			for (currentPlayer in parsedLineup) {
				if (player == currentPlayer) {
					delete parsedLastLineup[player];
				}
			}
		}
	}

	let altFile = 'data/' + message.guild.id + '-pingalts.json';
	let parsedList = {};
	if (fs.existsSync(altFile)) {
		currentList = fs.readFileSync(altFile, 'utf8');
		parsedList = JSON.parse(currentList);
	}

	message.guild.fetchMembers().then((guild) => {
		mentionText = 'Please mark your availability for this raid: \n';
		for (player in parsedLastLineup) {
			if (parsedList[player]) {
				player = parsedList[player];
			}
			// Try to find by nickname first
			var member = guild.members.find(member => member.nickname == player);
			// if you can't find by nickname, check username
			if (!member) {
				member = guild.members.find(member => member.user.username == player);
			}

			let playerId = player;
			if (member) {
				playerId = member.user.id;
			} else {
				console.log('Could not find ' + player);
			}
			mentionText += '<@' + playerId + '> ';
		}
		message.channel.send(mentionText);
	});
}