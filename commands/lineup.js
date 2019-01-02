const fs = require("fs");

exports.run = (client, message, args) => {
	// Determine if the player sending the message is an officer
	let isOfficer = false;
	if (message.guild !== null) {
		let officerRole = message.guild.roles.find(role => role.name === "Officer" || role.name === "Staff");

		if (message.member.roles.has(officerRole.id)) {
			isOfficer = true;
		}
	}
	if (!isOfficer) {
		return false;
	}
	
	if (message.channel.name.indexOf('signup') == -1) {
		message.channel.send("This command can only be used in a sign-up channel.");
		return false;
	}

	const raid = message.channel.name;
	const fileName = '/tmp/' + raid + '.json';
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
	message.channel.send(
		"Yes (" + yesArray.length + "): " + yesArray.join(', ') 
		+ '\n' + "Maybe (" + maybeArray.length + "): " + maybeArray.join(', ')
		+ '\n' + "No (" + noArray.length + "): " + noArray.join(', ')
	);
}