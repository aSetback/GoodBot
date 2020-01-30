const fs = require("fs");

exports.run = (client, message, args) => {
	// Allow a user to sign up in the sign-up channel
	message.delete().catch(O_o=>{}); 

	const raid = message.channel.name;
	const fileName = './signups/' + message.guild.id + '-' + raid + '.json';
	let parsedLineup = {};
	if (fs.existsSync(fileName)) {
		currentLineup = fs.readFileSync(fileName, 'utf8');
		parsedLineup = JSON.parse(currentLineup);
	}

	const classFile = 'data/' + message.guild.id + '-class.json';
	let classList = {};
	if (fs.existsSync(fileName)) {
		currentList = fs.readFileSync(classFile, 'utf8');
		classList = JSON.parse(currentList);
	}

	if (!classList) {
		return message.channel.send('Please set up player classes to use this command.');
	}
	
	const roleFile = 'data/' + message.guild.id + '-roles.json';
	let roleList = {};
	if (fs.existsSync(fileName)) {
		currentList = fs.readFileSync(roleFile, 'utf8');
		roleList = JSON.parse(currentList);
	}

	if (!roleList) {
		return message.channel.send('Please set up roles to use this command.');
	}

	const specs = {
		'warrior-tank': 'Protection Warriors',
		'paladin-tank': 'Protection Paladins',
		'druid-dps': 'Feral Druids',
		'paladin-healer': 'Holy Paladins',
		'druid-healer': 'Restoration Druids',
		'priest-healer': 'Holy/Discipline Priests',
		'priest-caster': 'Shadow Priests',
		'druid-caster': 'Balance Druids',
		'warlock-caster': 'Warlocks',
		'mage-caster': 'Mages',
		'hunter-dps': 'Hunters',
		'rogue-dps': 'Rogues',
		'warrior-dps': 'Fury/Arms Warriors',
		'paladin-dps': 'Retribution Paladins',
	};

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
		
		let playerRole = '';
		let playerKey = playerClass;
		if (playerClass != 'No') {
			if (roleList[player]) {
				playerRole = roleList[player];
				let playerSpec = playerClass.toLowerCase() + '-' + playerRole.toLowerCase();
				if (specs[playerSpec]) {
					playerKey = specs[playerSpec];
				} else {
					message.author.send('Could not find a valid spec for ' + player + ' (' + playerClass + '/' + playerRole + ')');
				}
			} else {
				message.author.send('Could not find a valid role for ' + player + ' (' + playerClass + ')');
			}
		}

		// Generate a list of removed players.
		delete(classList[player]);

		if (!classLineup[playerKey]) {
			classLineup[playerKey] = [];
		}
		
		if (signup === 'maybe') {
			player = '*' + player + '*';
			
		}
		classLineup[playerKey].push(player);
	}
	
	let classMessage = '__**' + raid + '**__\n' ;
	
	let unsigned = [];
	for (player in classList) {
		unsigned.push(player);
	}	
	
	for (className in classLineup) {
		classMessage += "**" + className + " (" + classLineup[className].length + "):** " + classLineup[className].join(", ") + "\n";
	}

	if (classLineup.length < 50) {
		classMessage += "**Unsigned (" + unsigned.length + "):** " + unsigned.join(", ") + "\n";
	}
	
	message.author.send(classMessage);
	
}