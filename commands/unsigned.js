const fs = require("fs");

exports.run = (client, message, args) => {
	message.delete().catch(O_o=>{}); 

	const raid = message.channel.name;

	// Attempt to parse out raid name & date
	const nameParts = raid.split('-');

	const raidName = nameParts[0];
	const raidMonth = nameParts[2];
	const raidDay = nameParts[3];

	var currentDay = new Date('2019/' + raidMonth + '/' + raidDay);
	var lastWeek = new Date(currentDay.getTime() - 7 * 24 * 60 * 60 * 1000);
	var lastRaidDay = ("0" + lastWeek.getDate()).slice(-2)
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
		for (currentPlayer in parsedLineup) {
			if (player == currentPlayer) {
				delete parsedLastLineup[player];
			}
		}
	}

	message.guild.fetchMembers().then((guild) => {
		mentionText = 'Please mark your availability for this raid: \n';
		for (player in parsedLastLineup) {
			var member = guild.members.find(member => member.nickname == player ||  member.user.username == player);

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