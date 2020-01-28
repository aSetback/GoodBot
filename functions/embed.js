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
				let title = "Raid Signups for " + raidName + ", " + dateString;
				let embed = createEmbed(title, fileName, message);		

				pinnedMsg.edit(currentContent, embed);
			});		
	},
}

function createEmbed(title, fileName, message) {
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

	const roleFile = 'data/' + message.guild.id + '-roles.json';
	let roleList = {};
	if (fs.existsSync(fileName)) {
		currentList = fs.readFileSync(roleFile, 'utf8');
		roleList = JSON.parse(currentList);
	}
	
	let signups = [];
	let noList = [];
	let maybeList = [];
	let data = {
		'title': title,
		'color': "#02a64f",
		'description': 'To sign up for this raid, please click on one of the emojis directly below this post.',
		'confirm': 0
	}
	Object.keys(parsedLineup).forEach(function(key) {
		let signup = parsedLineup[key];
		if (key == 'Goodbot' || key == 'confirmed') {

		} else if (key == 'data') {
			savedData = parsedLineup['data'];	
			Object.keys(savedData).forEach(function(key) {
				data[key] = savedData[key];
			});
		} else if (signup != 'yes') {
			if (signup == 'maybe') {
				maybeList.push(key);
			}
			if (signup == 'no') {
				noList.push(key);
			}
			delete parsedLineup[key];
		} else {
			parsedLineup[key] = {'name': key};

			Object.keys(classList).forEach(function(classKey) {
				if (classKey == key) {
					parsedLineup[key]['class'] = classList[classKey].toLowerCase();
				}
			});
			Object.keys(roleList).forEach(function(roleKey) {
				if (roleKey == key) {
					parsedLineup[key]['role'] = roleList[roleKey].toLowerCase();
				}
			});
			signups.push(parsedLineup[key]);
		}
	});

	let client = message.client;
	const emojis = {
		"warrior": client.emojis.find(emoji => emoji.name === "warrior"),
		"druid": client.emojis.find(emoji => emoji.name === "druid"),
		"paladin": client.emojis.find(emoji => emoji.name === "paladin"),
		"priest": client.emojis.find(emoji => emoji.name === "priest"),
		"mage": client.emojis.find(emoji => emoji.name === "mage"),
		"warlock": client.emojis.find(emoji => emoji.name === "warlock"),
		"rogue": client.emojis.find(emoji => emoji.name === "rogue"),
		"hunter": client.emojis.find(emoji => emoji.name === "hunter"),
		"shaman": client.emojis.find(emoji => emoji.name === "shaman"),
		"dk": client.emojis.find(emoji => emoji.name === "DK")
	}

	let embed = new Discord.RichEmbed()
	.setTitle(data.title)
	.setColor(data.color);
	const roles = {
		'tank': [
			'warrior',
			'druid',
			'paladin',
			'dk'
		],
		'healer': [
			'priest', 
			'paladin',
			'druid',
			'shaman'
		],
		'dps': [
			'rogue',
			'warrior',
			'druid',
			'paladin',
			'hunter',
			'shaman',
			'dk'
		],
		'caster': [
			'mage',
			'warlock',
			'priest',
			'druid',
			'shaman'
		]
	}

	embed.setDescription(data.description);
	let roleCount = {
		'tank': 0,
		'healer': 0,
		'dps': 0,
		'caster': 0
	};

	let confirmCount = 0;
	let confirmationList = [];
	if (parsedLineup['confirmed']) {
		confirmationList = parsedLineup['confirmed'];
	}
	Object.keys(roles).forEach(function(key) {
		let classes = roles[key];
		Object.keys(classes).forEach(function(classKey) {
			let classList = "";
			let playerClass = classes[classKey];
			let classCount = 0;
			Object.keys(signups).forEach(function(signupKey) {
				let signup = signups[signupKey];
				if (signup.role == key && signup.class == playerClass) {
					if (data['confirm']) {
						if (confirmationList.indexOf(signup.name.toLowerCase()) >= 0) {
							roleCount[key]++;
							classCount++;
							confirmCount++;
							classList += emojis[playerClass].toString() + ' **' + signup.name + '** [' + (parseInt(signupKey) + 1) + ']\n';
						} else {
							classList += emojis[playerClass].toString() + ' *' + signup.name + '* [' + (parseInt(signupKey) + 1) + ']\n';
						}
					} else {
						roleCount[key]++;
						classCount++;
						classList += emojis[playerClass].toString() + ' **' + signup.name + '** [' + (parseInt(signupKey) + 1) + ']\n';
					}
				}
			});
			if (classList.length) {
				playerClass = playerClass.charAt(0).toUpperCase() + playerClass.slice(1).toLowerCase();
				embed.addField('**' + playerClass + ' (' + key + ')**', classList, true);
			}
		});
	});
	roleField = '';
	for (key in roleCount) {
		roleName = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
		roleField += '**' + roleName + '**: ' + roleCount[key] + '\n';
	} 
	embed.addField('**Total Sign-ups**', signups.length);
	if (data['confirm']) {
		embed.addField('**Confirmed Sign-ups**', confirmCount);
	}
	embed.addField('**Group Composition**', roleField, false);

	if (maybeList.length) {
		embed.addField('**Maybe**', maybeList.join(', '));
	}
	if (noList.length) {
		embed.addField('**No**', noList.join(', '));
	}
	if (data['confirm']) {
		embed.addField('**Please Note:**', "Confirmation mode has been enabled.  The players with **bold** names are currently confirmed for the raid.  *Italicized* names may or may not be brought to this raid.");
	}
	embed.setTimestamp();

	return embed;
}