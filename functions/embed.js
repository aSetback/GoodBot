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
	Object.keys(parsedLineup).forEach(function(key) {
		let signup = parsedLineup[key];

		if (signup != 'yes') {
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
		"hunter": client.emojis.find(emoji => emoji.name === "hunter")
	}

	let embed = new Discord.RichEmbed()
	.setTitle(title)
	.setColor(0x02a64f);

	const roles = {
		'tank': [
			'warrior',
			'druid',
			'paladin'
		],
		'healer': [
			'priest', 
			'paladin',
			'druid'
		],
		'dps': [
			'rogue',
			'warrior',
			'druid',
			'paladin',
			'hunter'
		],
		'caster': [
			'mage',
			'warlock',
			'priest',
			'druid'
		]
	}

	embed.setDescription('To sign up for this raid, please click on one of the emojis directly below this post.');
	let fieldCount = 0;
	Object.keys(roles).forEach(function(key) {
		fieldCount++;
		let roleCount = 0;
		let classes = roles[key];
		let classList = "";
		Object.keys(classes).forEach(function(classKey) {
			Object.keys(signups).forEach(function(signupKey) {
				let signup = signups[signupKey];
				let playerClass = classes[classKey];
				if (signup.role == key && signup.class == playerClass) {
					roleCount++;
					classList += emojis[playerClass].toString() + ' **' + signup.name + '** [' + (parseInt(signupKey) + 1) + ']\n';
				}
			});
		});
		if (!classList.length) {
			classList = '-';
		}
		embed.addField('**' + key + '** [' + roleCount + ']', classList, true);
		if (fieldCount % 2 == 0) {
			embed.addBlankField();
		}
	});
	if (maybeList.length) {
		embed.addField('**maybe**', maybeList.join(', '));
	}
	if (noList.length) {
		embed.addField('**no**', noList.join(', '));
	}
	embed.setTimestamp();

	return embed;
}