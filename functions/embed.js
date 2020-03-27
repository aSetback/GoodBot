const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	update: (client, message, raid) => {
		let channel = message.channel;

		// Figure out our date
		let raidDate = new Date(Date.parse(raid.date));
		let dateString = raidDate.toLocaleString('en-us', { month: 'long' }) + " " + raidDate.getUTCDate();
		let raidType = raid.raid
		let raidName = '';

		if (raidType.toLowerCase() == 'mc') {
			raidName = 'Molten Core';
		} else if (raidType.toLowerCase() == 'ony') {
			raidName = 'Onyxia';
		} else if (raidType.toLowerCase() == 'aq40') {
			raidName = 'Temple of Ahn\'Qiraj';
		} else if (raidType.toLowerCase() == 'aq20') {
			raidName = 'Ruins of Ahn\'Qiraj';
		} else if (raidType.toLowerCase() == 'naxx') {
			raidName = 'Naxxramas';
		} else if (raidType.toLowerCase() == 'bwl') {
			raidName = 'Blackwing Lair';
		} else if (raidType.toLowerCase() == 'zg') {
			raidName = 'Zul\'Gurub';
		} else {
			category = channel.parent;
			raidName = raidName.charAt(0).toUpperCase() + raidName.slice(1).toLowerCase();
		}

		channel.fetchPinnedMessages()
			.then(function(list){
				pinnedMsg = list.last();
				if (!pinnedMsg) { return false; }
				currentContent = pinnedMsg.content;
				let title = "Raid Signups for " + raidName + ", " + dateString;
				let embed = updateEmbed(title, channel, client, pinnedMsg, raidType);		
			});		
	},
	getClasses: async function(client, guild) {
		let classList = new Promise((resolve, reject) => {
			client.models.playerClass.findAll({where: {'guildID': guild.id}}).then((classList) => {
				resolve(classList);
			});
		});
		return classList;
	},
	getRoles: async function(client, guild) {
		let roleList = new Promise((resolve, reject) => {
			client.models.playerRole.findAll({where: {'guildID': guild.id}}).then((roleList) => {
				resolve(roleList);
			});
		});
		return roleList;
	},
	getSignups: async function(client, channelID) {
		let signupList = new Promise((resolve, reject) => {
			client.models.signup.findAll({where: {'channelID': channelID}}).then((signupList) => {
				resolve(signupList);
			});
		});
		return signupList;
	}
};

async function updateEmbed(title, channel, client, pinnedMsg, raidType) {
	let signups = await client.embed.getSignups(client, channel.id);
	let classList = await client.embed.getClasses(client, channel.guild);
	let roleList = await client.embed.getRoles(client, channel.guild);
	let data = {
		'title': title,
		'color': "#02a64f",
		'description': 'To sign up for this raid, please click on one of the emojis directly below this post.',
		'confirm': 0
	}
	let maybeList = [];
	let noList = [];
	let lineup = [];
	// De-duplicate the sign-ups
	let dedupedSignups = [];
	signups.forEach((signup, signupKey) => {
		dedupedSignups.forEach((deduped, dedupedKey) => {
			if (signup.player == deduped.player) { 
				dedupedSignups.splice(dedupedKey, 1);
			}
		});
		dedupedSignups.push(signup);
	});

	dedupedSignups.forEach((signup) => {
		if (signup.signup == 'yes') {
			let playerClass = '';
			let playerRole = '';
			classList.forEach((classListItem) => {
				if (classListItem.player == signup.player) {
					playerClass = classListItem.class;
				}
			});
			roleList.forEach((roleListItem) => {
				if (roleListItem.player == signup.player) {
					playerRole = roleListItem.role;
				}
			});
			player = {
				name: signup.player,
				class: playerClass,
				role: playerRole
			}
			lineup.push(player);
		} else if (signup.signup == 'maybe') {
			maybeList.push(signup.player);
		} else if (signup.signup == 'no') {
			noList.push(signup.player);
		}
	})

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

	let icon = 'http://softball.setback.me/goodbot/icons/' + raidType + '.png';
	let embed = new Discord.RichEmbed()
	.setTitle(data.title)
	.setColor(data.color)
	.setThumbnail(icon);

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

	Object.keys(roles).forEach(function(key) {
		let classes = roles[key];
		Object.keys(classes).forEach(function(classKey) {
			let classList = "";
			let playerClass = classes[classKey];
			lineup.forEach(function(player, signupKey) {
				if (player.role == key && player.class == playerClass) {
					roleCount[key]++;
					classList += emojis[playerClass].toString() + ' **' + player.name + '** [' + (parseInt(signupKey) + 1) + ']\n';
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
	embed.addField('**Total Sign-ups**', (dedupedSignups.length - maybeList.length - noList.length));
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

	pinnedMsg.edit(currentContent, embed);
}