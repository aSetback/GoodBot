const fs = require("fs");

exports.run = (client, message, args) => {
	message.delete().catch(O_o=>{}); 

	const raid = message.channel.name;

	const filename = './signups/' + message.guild.id + '-' + raid + '.json';
	var parsedLastLineup = [];
	if (fs.existsSync(filename)) {
		lineup = fs.readFileSync(filename, 'utf8');
		parsedLineup = JSON.parse(lineup);
	} else {
		return message.channel.send("Error: Unable to find raid file: " + raid);
	}


	// Check if a player is found in both line-ups.
	for (player in parsedLineup) {
		if (parsedLineup[player] != "yes") {
			delete parsedLineup[player];
		}
	}

	message.guild.fetchMembers().then((guild) => {
		mentionText = '';
		for (player in parsedLineup) {
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