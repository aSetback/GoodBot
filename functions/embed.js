const Discord = require("discord.js");
const { Op } = require('sequelize');
const raid = require("./raid");

module.exports = {
	update: async (client, channel) => {
		// Confirm we have a raid
		let raid = await client.raid.get(client, channel);
		let raidChannel = await client.channels.find(c => c.id == raid.channelID);
		let embed = await client.embed.updateEmbed(client, raidChannel, raid);
		client.embed.edit(client, raidChannel, embed);

		if (raid.crosspostID && raid.crosspostID.length) {
			let crosspostChannel = await client.channels.find(c => c.id == raid.crosspostID);
			client.embed.edit(client, crosspostChannel, embed);
		}

	},
	edit: async (client, channel, embed) => {
		let list = await channel.fetchPinnedMessages();
		pinnedMsg = list.last();
		if (!pinnedMsg) { return false; }
		pinnedMsg.edit(embed);
	},
	getLineup: async (client, raid) => {
		// Get a list of all of our sign-ups
		let signups = {}
		signups = await client.signups.getSignups(client, raid);

		// Create an array of the character names signed up
		characterNames = [];
		for (key in signups) {
			characterNames.push(signups[key].player);
		}

		// Retrieve the raid's main cahnnel, attempt to retrieve information on all characters who signed up		
		let channel = await client.channels.find(c => c.id == raid.channelID);
		let characterList = await client.models.character.findAll(
			{
				attributes: [
					[client.sequelize.fn('DISTINCT', client.sequelize.col('name')), 'name'], 'class', 'role', 'fireResist', 'frostResist', 'shadowResist', 'natureResist'
				],
				where: {
					'guildID': channel.guild.id,
					name: {
						[Op.in]: characterNames
					}
				},
				orderBy: {
					updatedAt: 'DESC'
				}
			});

		let crosspostCharacterList = {};

		// If this raid is cross-posted, attempt to retrieve information from the second server as well
		if (raid.crosspostID && raid.crosspostID.length) {
			let crosspostChannel = await client.channels.find(c => c.id == raid.crosspostID);
			crosspostCharacterList = await client.models.character.findAll(
				{
					attributes: [
						[client.sequelize.fn('DISTINCT', client.sequelize.col('name')), 'name'], 'class', 'role', 'fireResist', 'frostResist', 'shadowResist', 'natureResist'
					],
					where: {
						'guildID': crosspostChannel.guild.id,
						name: {
							[Op.in]: characterNames
						}
					},
					orderBy: {
						updatedAt: 'DESC'
					}
				});
		}

		// Generate a line-up by looping through the signups
		let lineup = [];
		signups.forEach((signup) => {
			let match = false;
			for (key in characterList) {
				let characterListItem = characterList[key];
				if (characterListItem.name == signup.player) {
					match = true;
					lineup.push({
						name: signup.player,
						class: characterListItem.class,
						role: characterListItem.role,
						confirmed: signup.confirmed,
						signup: signup.signup,
						resists: {
							fire: characterListItem.fireResist ? characterListItem.fireResist : 0,
							frost: characterListItem.frostResist ? characterListItem.frostResist : 0,
							nature: characterListItem.natureResist ? characterListItem.natureResist : 0,
							shadow: characterListItem.shadowResist ? characterListItem.shadowResist : 0,
						}
					});
				}
			}

			if (!match) {
				for (key in crosspostCharacterList) {
					let characterListItem = crosspostCharacterList[key];
					if (characterListItem.name == signup.player) {
						lineup.push({
							name: signup.player,
							class: characterListItem.class,
							role: characterListItem.role,
							confirmed: signup.confirmed,
							signup: signup.signup,
							resists: {
								fire: characterListItem.fireResist ? characterListItem.fireResist : 0,
								frost: characterListItem.frostResist ? characterListItem.frostResist : 0,
								nature: characterListItem.natureResist ? characterListItem.natureResist : 0,
								shadow: characterListItem.shadowResist ? characterListItem.shadowResist : 0,
							}
						});
					}
				}
			}
		});

		return lineup;
	},
	getSignups: async (client, raidID) => {
		let signupList = new Promise((resolve, reject) => {
			client.models.signup.findAll({
				where: {
					raidID: raidID
				},
				order: [['createdAt', 'DESC']],
				group: ['player']
			}).then((signupList) => {
				resolve(signupList);
			});
		});
		return signupList;
	},
	updateEmbed: async (client, channel, raid) => {
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
			instanceName = raids[raid.raid.toLowerCase()];
		} else {
			instanceName = raid.raid.charAt(0).toUpperCase() + raid.raid.slice(1).toLowerCase();
		}

		raidName = raid.name ? raid.name : instanceName;

		let title = "Raid Signups for " + raidName;
		let lineup = await client.embed.getLineup(client, raid);
		let raidDate = new Date(Date.parse(raid.date));
		let dateString = raidDate.toLocaleString('en-us', { month: 'long', timeZone: 'UTC' }) + " " + raidDate.getUTCDate();
		let raidData = {};
		raidData.color = raid.color ? raid.color : '#02a64f';
		raidData.description = raid.description ? raid.description : 'To sign up for this raid, please click on one of the emojis directly below this post.'
		raidData.title = raid.title ? raid.title : title;

		let maybeList = [];
		let noList = [];

		// De-duplicate the sign-ups
		lineup.forEach((player) => {
			if (player.signup == 'maybe') {
				maybeList.push(player.name);
			} else if (player.signup == 'no') {
				noList.push(player.name);
			}
		});

		let emojis = {};
		try {
			emojis = {
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
		} catch (error) {
			emojis = {
				"warrior": "",
				"druid": "",
				"paladin": "",
				"priest": "",
				"mage": "",
				"warlock": "",
				"rogue": "",
				"hunter": "",
				"shaman": "",
				"dk": "",
				"monk": "",
				"dh": ""
			}
		}
		let icon = 'http://softball.setback.me/goodbot/icons/' + raid.raid + '.png';
		let embed = new Discord.RichEmbed()
			.setTitle(raidData.title)
			.setColor(raidData.color)
			.setThumbnail(icon);

		let fields = 0;
		if (raid.locked) {
			embed.addField('**Status**', '**Locked**\n\n__Please note__: *Players can not currently sign up for this raid or add new reserves.*');
			fields++;
		}

		let leader = channel.guild.members.find(member => member.id == raid.memberID);
		if (!leader) {
			leader = "-";
		}
		fields++;
		embed.addField('**Raid Leader**', leader, true);

		fields++;
		// let subject = raidData.title ? raidData.title : raidName;
		// let icsLink = 'http://ics.agical.io/?subject=' + subject + '&organizer=' + leader.user.username + '&reminder=45&location=' + instanceName + '&dtstart=' + raidDate.toISOString() + '&dtend=' + raidDate.toISOString();
		// embed.addField('**Date**', dateString + '\n[ics](' + encodeURI(icsLink) + ')', true);
		embed.addField('**Date**', dateString, true);
		if (!raid.time) {
			raid.time = '-';
		}

		fields++;
		embed.addField('**Time**', raid.time, true);

		if (raid.softreserve) {
			let softReserveText = "To reserve an item, use `+reserve PlayerName Full Item Name`\nTo see all current reserves, use `+reservelist`\nTo view items eligible for reserving, use `+reserveitems`";
			let raidHash = await client.models.raidHash.findOne({where: {memberID: raid.memberID, guildID: raid.guildID}});
			if (raidHash) {
				softReserveText += "\nYou can also manage your soft reserve at: http://goodbot.me/r/" + raid.id
			}
			embed.addField('**Soft Reserve**', softReserveText);
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
		let signups = 0;
		Object.keys(roles).forEach(function (key) {
			let classes = roles[key];
			Object.keys(classes).forEach(function (classKey) {
				let classList = "";
				let playerClass = classes[classKey];
				lineup.forEach(function (player, signupKey) {
					if (player.role == key && player.class == playerClass && player.signup == 'yes') {
						let number = parseInt(signupKey);
						number++;
						signups++;
						roleCount[key]++;
						if (raid.confirmation) {
							if (player.confirmed) {
								classList += emojis[playerClass].toString() + ' **' + player.name + '** [' + number + ']\n';
								confirmCount++;
							} else {
								classList += emojis[playerClass].toString() + ' *' + player.name + '* [' + number + ']\n';
							}
						} else {
							classList += emojis[playerClass].toString() + ' ' + player.name + ' [' + number + ']\n';
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
					fields++;
					embed.addField('**' + playerClass + ' (' + key + ')**', classList, true);
				}
			});
		});
		roleField = '';
		for (key in roleCount) {
			roleName = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
			roleField += '**' + roleName + '**: ' + roleCount[key] + '\n';
		}
		embed.addField('**Total Sign-ups**', signups);
		fields++;

		if (raid.confirmation) {
			embed.addField('**Confirmed Sign-ups**', confirmCount);
			fields++;
		}
		if (fields < 25) {
			embed.addField('**Group Composition**', roleField, false);
			fields++;
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

		return embed;
	}
};