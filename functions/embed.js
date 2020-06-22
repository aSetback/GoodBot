const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	update: (client, message, raid) => {
		let channel = message.channel;

		// Figure out our date
		let raidDate = new Date(Date.parse(raid.date));
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
				let title = "Raid Signups for " + raidName;
				let embed = updateEmbed(title, channel, client, pinnedMsg, raidType);		
			});		
	},
	getCharacters: async function(client, guild) {
		let characterList = new Promise((resolve, reject) => {
			client.models.character.findAll({where: {'guildID': guild.id}}).then((characterList) => {
				resolve(characterList);
			});
		});
		return characterList;
	},
	getSignups: async function(client, channelID) {
		let signupList = new Promise((resolve, reject) => {
			client.models.signup.findAll({where: {'channelID': channelID}, order: [['createdAt', 'DESC']], group: ['player']}).then((signupList) => {
				resolve(signupList);
			});
		});
		return signupList;
	}
};

async function updateEmbed(title, channel, client, pinnedMsg, raidType) {
	let signups = await client.embed.getSignups(client, channel.id);
	let characterList = await client.embed.getCharacters(client, channel.guild);
	let raid = await client.signups.getRaid(client, channel);
	let raidDate = new Date(Date.parse(raid.date));
	let dateString = raidDate.toLocaleString('en-us', { month: 'long' }) + " " + raidDate.getUTCDate();

	let raidData = {};
	raidData.color = raid.color ? raid.color : '#02a64f';
	raidData.description = raid.description ? raid.description : 'To sign up for this raid, please click on one of the emojis directly below this post.'
	raidData.title = raid.title ? raid.title : title;

	let maybeList = [];
	let noList = [];
	let lineup = [];

	// De-duplicate the sign-ups
	let total = 0;
	signups.forEach((signup) => {
		if (signup.signup == 'yes') {
			total++;
			characterList.forEach((characterListItem) => {
				if (characterListItem.name == signup.player) {
					lineup.push({
						name: signup.player,
						class: characterListItem.class,
						role: characterListItem.role,
						confirmed: signup.confirmed
					});					
				}
			});
		} else if (signup.signup == 'maybe') {
			maybeList.push(signup.player);
		} else if (signup.signup == 'no') {
			noList.push(signup.player);
		}
	});

	lineup.reverse();

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
	.setTitle(raidData.title)
	.setColor(raidData.color)
	.setThumbnail(icon);

	if (raid.locked) {
		embed.addField('**Status**', '**Locked**\n\n__Please note__: *Players can not currently sign up for this raid or add new reserves.*');
	}

	let leader = channel.guild.members.find(member => member.id == raid.memberID);
	if (!leader) {
		leader = "-";
	}
	embed.addField('**Raid Leader**', leader, true);
	

	embed.addField('**Date**', dateString, true);
	if (raid.time) {
		raid.time = '-';
	}
	embed.addField('**Time**', raid.time, true);


	if (raid.softreserve) {
		embed.addField('**Soft Reserve**', "To reserve an item, use `+reserve PlayerName Full Item Name`\nTo see all current reserves, use `+reservelist`\nTo view items eligible for reserving, use `+reserveitems`");
	}

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

	embed.setDescription(raidData.description);
	let roleCount = {
		'tank': 0,
		'healer': 0,
		'dps': 0,
		'caster': 0
	};

	let confirmCount = 0;
	Object.keys(roles).forEach(function(key) {
		let classes = roles[key];
		Object.keys(classes).forEach(function(classKey) {
			let classList = "";
			let playerClass = classes[classKey];
			lineup.forEach(function(player, signupKey) {
				if (player.role == key && player.class == playerClass) {
					roleCount[key]++;
					if (raid.confirmation) {
						if (player.confirmed) {
							classList += emojis[playerClass].toString() + ' **' + player.name + '** [' + (parseInt(signupKey) + 1) + ']\n';
							confirmCount++;
						} else {
							classList += emojis[playerClass].toString() + ' *' + player.name + '* [' + (parseInt(signupKey) + 1) + ']\n';
						}
					} else { 
						classList += emojis[playerClass].toString() + ' ' + player.name + ' [' + (parseInt(signupKey) + 1) + ']\n';
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
	embed.addField('**Total Sign-ups**', total);
	if (raid.confirmation) {
		embed.addField('**Confirmed Sign-ups**', confirmCount);
	}
	embed.addField('**Group Composition**', roleField, false);

	if (maybeList.length) {
		embed.addField('**Maybe**', maybeList.join(', '));
	}
	if (noList.length) {
		embed.addField('**No**', noList.join(', '));
	}
	if (raid.confirmation) {
		embed.addField('**Please Note:**', "Confirmation mode has been enabled.  The players with **bold** names are currently confirmed for the raid.  *Italicized* names may or may not be brought to this raid.");
	}
	embed.setTimestamp();

	pinnedMsg.edit(currentContent, embed);
}