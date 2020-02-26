exports.run = (client, message, args) => {
	if (!message.isAdmin) {
		return false;
	}

    var fs = require('fs');
	message.delete();

    const raid = message.channel.name;
	const fileName = './signups/' + message.guild.id + '-' + raid + '.json';
	let parsedLineup = {};
	if (fs.existsSync(fileName)) {
		currentLineup = fs.readFileSync(fileName, 'utf8');
		parsedLineup = JSON.parse(currentLineup);
	}

	let playerList = "```\n";
	for (player in parsedLineup) {
		result = parsedLineup[player];
		if (result == 'yes') {
            playerList += player + "\n";
        }
    }
    playerList += "```";
    message.channel.send(playerList);

}
