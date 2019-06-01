const fs = require("fs");

exports.run = (client, message, args) => {
	// Allow a user to sign up in the sign-up channel
	message.delete().catch(O_o=>{}); 

	const raid = message.channel.name;
	const fileName = './signups/' + raid + '.json';
	let parsedLineup = {};
	if (fs.existsSync(fileName)) {
		currentLineup = fs.readFileSync(fileName, 'utf8');
		parsedLineup = JSON.parse(currentLineup);
	}

	const classFile = 'data/class.json';
	let classList = {};
	if (fs.existsSync(fileName)) {
		currentList = fs.readFileSync(classFile, 'utf8');
		classList = JSON.parse(currentList);
	}
	
	let classLineup = {'No':[]};
	for (player in parsedLineup) {
		let signup = parsedLineup[player];
		if (signup == 'no') {
			playerClass = 'No';
		} else if (classList[player]) {
			playerClass = classList[player];
		} else {
			playerClass = 'Unknown';
		}
		playerClass = playerClass.charAt(0).toUpperCase() + playerClass.slice(1).toLowerCase();
		// Generate a list of removed players.
		delete(classList[player]);

		if (!classLineup[playerClass]) {
			classLineup[playerClass] = [];
		}
		
		if (signup === 'maybe') {
			player = '*' + player + '*';
			
		}
		classLineup[playerClass].push(player);
	}
	
	let classMessage = '__**' + raid + '**__\n' ;
	
	let unsigned = [];
	for (player in classList) {
		unsigned.push(player);
	}	
	
	for (className in classLineup) {
		classMessage += "**" + className + " (" + classLineup[className].length + "):** " + classLineup[className].join(", ") + "\n";
	}

	classMessage += "**Unsigned (" + unsigned.length + "):** " + unsigned.join(", ") + "\n";
	
	message.author.send(classMessage);
	
}