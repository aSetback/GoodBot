const Discord = require("discord.js");
const { Op } = require('sequelize');

module.exports = {
	update: (client, message, raid) => {
		let channel = message.channel;

		// Figure out our date
		let raidDate = new Date(Date.parse(raid.date));
		let raidType = raid.raid
		let raidName = '';
		
		let raids = {
			'mc': 'Molten Core',
			'ony': 'Onyxia',
			'aq40': 'Temple of Ahn\'Qiraj',
			'aq20': 'Ruins of Ahn\'Qiraj',
			'naxx': 'Naxxramas',
			'bwl': 'Blackwing Lair',
			'zg': 'Zul\'Gurub',
			'kz': 'Karazhan',
			'gruul': 'Gruul\'s Lair',
			'ssc': 'Serpentshrine Cavern',
			'tk': 'Tempest Keep',
			'sw': 'Sunwell',
			'bt': 'Black Temple',
			'voa': 'Vault of Archavon',
			'os': 'Obsidian Sanctum',
			'eoe': 'Eye of Eternity',
			'uld': 'Ulduar',
			'toc': 'Trial of the Crusader',
			'icc': 'Icecrown Citadel'
		}
		if (raids[raid.raid.toLowerCase()]) {
			raidName = raids[raid.raid.toLowerCase()];
		} else {
			category = channel.parent;
			raidName = raid.raid.charAt(0).toUpperCase() + raid.raid.slice(1).toLowerCase();
		}

		if (raid.name) {
			raidName = raid.name;
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
	getCharacters: async function(client, guild, signups) {
		characterNames = [];
		for (key in signups) {
			characterNames.push(signups[key].player);
		}

		let characterList = new Promise((resolve, reject) => {
			client.models.character.findAll(
				{
					attributes: [
						[client.sequelize.fn('DISTINCT', client.sequelize.col('name')), 'name'], 'class', 'role', 'fireResist', 'frostResist', 'shadowResist', 'natureResist'
					], 
					where: {
						'guildID': guild.id, 
						name: { 
							[Op.in]: characterNames 
						}
					},
					orderBy: {
						updatedAt: 'DESC'
					}
				}
			).then((characterList) => {
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
	let characterList = await client.embed.getCharacters(client, channel.guild, signups);
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
		"warrior": client.emojis.find(emoji => emoji.name === "GBwarrior"),
		"druid": client.emojis.find(emoji => emoji.name === "GBdruid"),
		"paladin": client.emojis.find(emoji => emoji.name === "GBpaladin"),
		"priest": client.emojis.find(emoji => emoji.name === "GBpriest"),
		"mage": client.emojis.find(emoji => emoji.name === "GBmage"),
		"warlock": client.emojis.find(emoji => emoji.name === "GBwarlock"),
		"rogue": client.emojis.find(emoji => emoji.name === "GBrogue"),
		"hunter": client.emojis.find(emoji => emoji.name === "GBhunter"),
		"shaman": client.emojis.find(emoji => emoji.name === "GBshaman"),
		"dk": client.emojis.find(emoji => emoji.name === "GBdk"),
		"monk": client.emojis.find(emoji => emoji.name === "GBmonk"),
		"dh": client.emojis.find(emoji => emoji.name === "GBdh")
	}

	let icon = 'http://softball.setback.me/goodbot/icons/' + raidType + '.png';
	let embed = new Discord.RichEmbed()
		.setTitle(raidData.title)
		.setColor(raidData.color)
		.setThumbnail(icon);

	let fields = 0;
	if (raid.locked) {
		embed.addField('**Status**', '**Locked**\n\n__Please note__: *Players can not currently sign up for this raid or add new reserves.*');
		fields ++;
	}

	let leader = channel.guild.members.find(member => member.id == raid.memberID);
	if (!leader) {
		leader = "-";
	}
	fields ++;
	embed.addField('**Raid Leader**', leader, true);
	

	fields ++;
	embed.addField('**Date**', dateString, true);
	if (!raid.time) {
		raid.time = '-';
	}

	fields ++;
	embed.addField('**Time**', raid.time, true);

	if (raid.softreserve) {
		embed.addField('**Soft Reserve**', "To reserve an item, use `+reserve PlayerName Full Item Name`\nTo see all current reserves, use `+reservelist`\nTo view items eligible for reserving, use `+reserveitems`");
	}

	const roles = {
		'tank': [
			'warrior',
			'druid',
			'paladin',
			'dk',
			'monk',
			'dh'
		],
		'healer': [
			'priest', 
			'paladin',
			'druid',
			'shaman',
			'monk'
		],
		'dps': [
			'rogue',
			'warrior',
			'druid',
			'paladin',
			'hunter',
			'shaman',
			'dk',
			'monk',
			'dh'
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
				if (playerClass == 'Dh') {
					playerClass = 'Demon Hunter';
				}

				if (playerClass == 'Dk') {
					playerClass = 'Death Knight';
				}
				fields ++;
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
	fields ++;

	if (raid.confirmation) {
		embed.addField('**Confirmed Sign-ups**', confirmCount);
		fields ++;
	}
	if (fields < 25) {
		embed.addField('**Group Composition**', roleField, false);
		fields ++;
	}


	if (fields < 23) {
		if (maybeList.length) {
			embed.addField('**Maybe**', maybeList.join(', '));
		}
		if (noList.length) {
			embed.addField('**No**', noList.join(', '));
		}
	}
	if (raid.confirmation) {
		embed.addField('**Please Note:**', "Confirmation mode has been enabled.  The players with **bold** names are currently confirmed for the raid.  *Italicized* names may or may not be brought to this raid.");
	}
	embed.setTimestamp();

	pinnedMsg.edit(currentContent, embed);
}