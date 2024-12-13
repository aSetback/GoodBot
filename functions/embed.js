const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
	update: async (client, channel) => {
		// Confirm we have a raid
		let raid = await client.raid.get(client, channel);
		let raidChannel = await client.channels.cache.find(c => c.id == raid.channelID);
		let embed = await client.embed.updateEmbed(client, raidChannel, raid);
		let crosspostChannel = null;
		if (raid.crosspostID && raid.crosspostID.length) {
			crosspostChannel = await client.channels.cache.find(c => c.id == raid.crosspostID);
		}

		// Prevent the embed from trying to refresh more than once a second.
		if (client.embeds[raid.id] && client.embeds[raid.id].timeout) {
			client.embeds[raid.id].embed = embed;
		} else {
			client.embeds[raid.id] = {
				embed: embed,
				timeout: setTimeout(() => {
					embed = client.embeds[raid.id].embed;
					client.embed.edit(client, raidChannel, embed, raid);
					if (crosspostChannel) {
						client.embed.edit(client, crosspostChannel, embed, raid);
					}
					client.embeds[raid.id].timeout = null;
				}, 1000)
			};
		}
	},
	edit: async (client, channel, embed, raid) => {
		let list = await channel.messages.fetchPinned();
		pinnedMsg = list.last();
		if (!pinnedMsg) { return false; }
		
		let buttonRow = new ActionRowBuilder()
			.addComponents(
				client.buttons.yes,
				client.buttons.no,
				client.buttons.maybe
			);
		if (raid.softreserve) {
			client.buttons.reserves.setURL('https://goodbot.me/r/' + raid.id);
			buttonRow.addComponents(client.buttons.reserves);
		}
		pinnedMsg.edit({ embeds: [embed], components: [buttonRow] });
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
			'icc': 'Icecrown Citadel',
			'ny': "Ny'alotha",
			'bwd': "Blackwing Descent",
			'bot': "The Bastion of Twilight",
			'tofw': "Throne of the Four Winds",
			'bh': "Baradin Hold",
			'fl': "Firelands",
			'ds': "Dragon Soul"
		}
		if (raids[raid.raid.toLowerCase()]) {
			instanceName = raids[raid.raid.toLowerCase()];
		} else {
			instanceName = raid.raid.charAt(0).toUpperCase() + raid.raid.slice(1).toLowerCase();
		}

		raidName = raid.name ? raid.name : instanceName;

		let title = "Raid Signups for " + raidName;
		let raidDate = new Date(Date.parse(raid.date));
		let dateString = raidDate.toLocaleString('en-us', { month: 'long', timeZone: 'UTC' }) + " " + raidDate.getUTCDate();
		let raidData = {};
		raidData.color = raid.color ? raid.color : '#02a64f';
		raidData.description = raid.description ? raid.description : 'To sign up for this raid, please click on one of the emojis directly below this post.'
		raidData.title = raid.title ? raid.title : title;

		let emojis = {};
		try {
			emojis = {
				"warrior": client.emojis.cache.find(emoji => emoji.name === "GBwarrior").toString(),
				"druid": client.emojis.cache.find(emoji => emoji.name === "GBdruid").toString(),
				"paladin": client.emojis.cache.find(emoji => emoji.name === "GBpaladin").toString(),
				"priest": client.emojis.cache.find(emoji => emoji.name === "GBpriest").toString(),
				"mage": client.emojis.cache.find(emoji => emoji.name === "GBmage").toString(),
				"warlock": client.emojis.cache.find(emoji => emoji.name === "GBwarlock").toString(),
				"rogue": client.emojis.cache.find(emoji => emoji.name === "GBrogue").toString(),
				"hunter": client.emojis.cache.find(emoji => emoji.name === "GBhunter").toString(),
				"shaman": client.emojis.cache.find(emoji => emoji.name === "GBshaman").toString(),
				"dk": client.emojis.cache.find(emoji => emoji.name === "GBdk").toString(),
				"monk": client.emojis.cache.find(emoji => emoji.name === "GBmonk").toString(),
				"dh": client.emojis.cache.find(emoji => emoji.name === "GBdh").toString(),
				"tank": client.emojis.cache.find(emoji => emoji.name === "GBtank").toString(),
				"healer": client.emojis.cache.find(emoji => emoji.name === "GBhealer").toString(),
				"dps": client.emojis.cache.find(emoji => emoji.name === "GBdps").toString(),
				"caster": client.emojis.cache.find(emoji => emoji.name === "GBcaster").toString(),
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

		let icon = 'https://goodbot.me/images/icons/' + raid.raid.toLowerCase().replace(/\s/g, "") + '.png';
		let embed = new Discord.EmbedBuilder()
			.setTitle(raidData.title)
			.setColor(raidData.color)
			.setThumbnail(icon);
		embed.setDescription(raidData.description);
		let embedFields = [];

		if (raid.locked) {
			embedFields.push({name: '**Status**', value: '**Locked**\n\n__Please note__: *Players can not currently sign up for this raid or add new reserves.*'});
		}

		let leaders = [];
		// Add our original raid leader
		if (!raid.leaders.find(m => m.id == raid.memberID)) {
			let member;
			try {
				member = await channel.guild.members.fetch(raid.memberID);
			} catch(e) {
				console.log(e);
			}

			if (!member) { member = '-'; }
			leaders.push(member);
		}


		raid.leaders.forEach(async (leader) => {
			let member = await channel.guild.members.fetch(leader.memberID);
			if (leader) { leaders.push(member); }
		});
		

		if (leaders.length) {
			embedFields.push({name: '**Raid Leader**', value: leaders.join('\n'), inline: true});
		}

		embedFields.push({name: '**Date**', value: dateString, inline: true});
		if (!raid.time) {
			raid.time = '-';
		}

		embedFields.push({name: '**Time**', value: raid.time, inline: true});

		// Preserve our original key to display sign-up order
		raid.signups.forEach((signup, key) => {
			raid.signups[key].order = key + 1;
			if (signup.role) {
				raid.signups[key].character.role = signup.role;
			}
		});

		cleanSignups = raid.signups.filter(s => s.character != null);

		// Sort our sign-ups by role, then class
		let sortedLineup = cleanSignups.sort((a, b) => {
			if (a.character.role > b.character.role) {
				return -1;
			} else if (a.character.role < b.character.role) {
				return 1;
			} else {
				if (a.character.class > b.character.class) {
					return 1;
				} else if (a.character.class < b.character.class) {
					return -1;
				} else {
					return 0;
				}
			}
		});

		// Set up variables for holding our embed data
		let prevSignup = null;
		let signups = [];
		let embeds = [];
		let confirmed = 0;
		let otherSignups = {'no': [], 'maybe': []};
		let roleCount = {
			'tank': 0,
			'healer': 0,
			'dps': 0,
			'caster': 0
		};
	
		// Output our embed fields
		sortedLineup.forEach((signup, key) => {

			// If we're on a different class/role than the previous signup, we need to start a new embed field
			if (prevSignup != null && (signup.character.role != prevSignup.character.role || signup.character.class != prevSignup.character.class)) {
				if (signups.length) {
					embeds.push({
						'name': emojis[prevSignup.character.role] + ' ' + client.general.ucfirst(prevSignup.character.class), 
						'signups': signups
					});
				}
				signups = [];
			}
			
			// Generate our signup string
			let signupString = emojis[signup.character.class] + ' ' + signup.character.name;
			if (raid.confirmation) {
				signupString = signup.confirmed && signup.signup == 'yes' ? '**' + signupString + '**' : '*' + signupString + '*';
			}

			// Add signup number
			signupString += ' [' + signup.order + ']';

			// Push the signup string to an array for this class.
			if (signup.signup == 'yes') {
				signups.push(signupString);

				// Update counts for confirmations & roles
				roleCount[signup.character.role]++;
				if (signup.confirmed) {
					confirmed++;
				}
			} else if (signup.signup == 'maybe') {
				otherSignups[signup.signup].push(signup.confirmed ? '**' + signup.character.name + '**' : signup.character.name);
			} else {
				otherSignups['no'].push(signup.confirmed ? '**' + signup.character.name + '**' : signup.character.name);
			}

			// Store our signup for the next iteration
			prevSignup = signup;
		});

		// If we have at least one signup, add the embed field for the last signup class/role combo
		if (prevSignup) {
			if (signups.length) {
				embeds.push({
					'name': emojis[prevSignup.character.role] + ' ' + client.general.ucfirst(prevSignup.character.class), 
					'signups': signups
				});
			}
		}

		// Add our fields
		embeds.forEach((embedField) => {
			if (embedField.signups.length > 0) {
				embedFields.push({name: embedField.name, value: embedField.signups.join('\n'), inline: true});
			}
		});

		// keep an even number of rows
		if (embeds.length % 3 == 2) {
			embedFields.push({name: '-', value: '-', inline: true});
		}

		let confirmedText = raid.confirmation ? '**Confirmed:** ' + confirmed + '\n' : '';
		let maybeText = otherSignups['maybe'].length ? '**Maybe:** ' + otherSignups['maybe'].join(', ') + '\n' : '';
		let noText = otherSignups['no'].length ? '**No:** ' + otherSignups['no'].join(', ') + '\n' : '';
		let raidComp = emojis['tank'] + ' ' + roleCount['tank'] + '   ';
		raidComp += emojis['healer'] + ' ' + roleCount['healer'] + '   '; 
		raidComp += emojis['dps'] + ' ' + roleCount['dps'] + '   '; 
		raidComp += emojis['caster'] + ' ' + roleCount['caster'] + '\n'; 

		embedFields.push({name: 'Sign-ups', value: 
			maybeText +
			noText +
			confirmedText + 
			'**Total:** ' + cleanSignups.filter(s => s.signup == 'yes').length + '\n' +
			raidComp
		});

		if (raid.confirmation) {
			embedFields.push({name: '**Confirmation Mode**', value:
				'Please note that confirmation mode has been enabled!\n' +
				'**Bold** names are currently confirmed for the raid. \n' +
				'*Italicized* names may or may not be brought to this raid.'
			});
		}

		if (raid.softreserve) {
			let softReserveText = "\nReserve Limit: " + ((raid.reserveLimit != null) ? raid.reserveLimit : "1") + "\n";
			softReserveText += "To reserve an item, use the command `/reserve`\nTo view items eligible for reserving, use the command `/reserveitems`";
			let raidHash = await client.models.raidHash.findOne({where: {memberID: raid.memberID, guildID: raid.guildID}});
			if (raidHash) {
				softReserveText += "\nYou can also manage your soft reserve at: http://goodbot.me/r/" + raid.id
			}
			embedFields.push({name: '**Soft Reserve**', value: softReserveText});
		}

		embed.addFields(embedFields);
		embed.setTimestamp();

		return embed;
	}
};