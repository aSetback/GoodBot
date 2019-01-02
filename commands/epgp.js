const fs = require("fs");

exports.run = (client, message, args) => {
	// Determine if the player sending the message is an officer
	let isGain = false;
	if (message.guild !== null) {
		if (message.guild.id == '350833594236796928') {
			isGain = true;
		}
	}
	if (!isGain) {
		return false;
	}

	let player = args.shift();
	if (!player) { 
		message.channel.send("EPGP: Please give a player name to look up.");
		return false; 
	}
	
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
	
	if (player.toLowerCase() == 'all') {
		message.author.send('EPGP Standings:\n');
		let epgpMessage = '';
		for (key in jsonStandings) {
			let standing = jsonStandings[key];
			let player = standing[0];
			let ep = standing[1];
			let gp = standing[2];
			epgpMessage += player.padEnd(20) + (ep + " EP").padEnd(12) + (gp + " GP ").padEnd(12) + (ep/gp).toFixed(2).padEnd(8) + "\n";
			if (epgpMessage.length > 1500) {
				message.author.send("```" + epgpMessage + "\n```");
				epgpMessage = '';
			}
		}
		message.author.send("```\n" + epgpMessage + "\n```");
		message.channel.send("EPGP: Standings have been sent to you via direct message.");
		return false;	
	}
	
	// Show the requested standing
	var ep, gp;
	for (key in jsonStandings) {
		standing = jsonStandings[key];
		if (standing[0].toLowerCase() === player.toLowerCase()) {
			player = standing[0];
			ep = standing[1];
			gp = standing[2];
			message.channel.send("EPGP for " + player + ": " + ep + " EP, " + gp + " GP (" + (ep/gp).toFixed(2) + " priority)");
			return true;
		}
	}

	message.channel.send("EPGP: Could not find player in standings.");
}