const Discord = require("discord.js");
const { Op } = require('sequelize');
const character = require("./character");
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
		let leader = channel.guild.members.find(member => member.id == raid.memberID);
		let raidDate = new Date(Date.parse(raid.date));
		let dateString = raidDate.toLocaleString('en-us', { month: 'long', timeZone: 'UTC' }) + " " + raidDate.getUTCDate();
		let raidData = {};
		raidData.color = raid.color ? raid.color : '#02a64f';
		raidData.description = raid.description ? raid.description : 'To sign up for this raid, please click on one of the emojis directly below this post.'
		raidData.title = raid.title ? raid.title : title;


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
				"dh": client.emojis.find(emoji => emoji.name === "GBdh"),
				"tank": client.emojis.find(emoji => emoji.name === "GBtank"),
				"healer": client.emojis.find(emoji => emoji.name === "GBhealer"),
				"dps": client.emojis.find(emoji => emoji.name === "GBdps"),
				"caster": client.emojis.find(emoji => emoji.name === "GBcaster"),
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

		// Generate calendar links if the time is set.
		if (raid.time) {
			let subject = raidData.title ? raidData.title + ' (' + instanceName + ')' : raidName;
			let parsedTime = client.general.parseTime(raid.time);
			if (parsedTime) {
				let formattedDate = raidDate.toISOString().slice(0, 11) + parsedTime + '-04:00';
				let zDate = new Date(Date.parse(formattedDate));
				let icsLink = 'http://ics.agical.io/?subject=' + subject + '&organizer=' + leader.user.username + '&reminder=45&location=' + instanceName + '&dtstart=' + formattedDate;
				let gcalLink = 'https://www.google.com/calendar/render?action=TEMPLATE&text=' + subject + '&location=' + instanceName + '&dates=' + zDate.toISOString().replace(/-/g, '').replace(/:/g, '').replace('.000', '') + '/' + zDate.toISOString().replace(/-/g, '').replace(/:/g, '').replace('.000', '');
				raidData.description += '\n[ics](' + encodeURI(icsLink) + ') [gcal](' + encodeURI(gcalLink) + ')'
			}
		}
		embed.setDescription(raidData.description);

		if (raid.locked) {
			embed.addField('**Status**', '**Locked**\n\n__Please note__: *Players can not currently sign up for this raid or add new reserves.*');
			fields++;
		}

		if (!leader) {
			leader = "-";
		}
		fields++;
		embed.addField('**Raid Leader**', leader, true);

		fields++;
		embed.addField('**Date**', dateString, true);
		if (!raid.time) {
			raid.time = '-';
		}

		fields++;
		embed.addField('**Time**', raid.time, true);

		// Preserve our original key to display sign-up order
		raid.signups.forEach((signup, key) => {
			raid.signups[key].order = key + 1;
		});

		// Sort our sign-ups by role, then class
		let sortedLineup = raid.signups.sort((a, b) => {
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
				embeds.push({
					'name': emojis[prevSignup.character.role] + ' ' + client.general.ucfirst(prevSignup.character.class), 
					'signups': signups
				});
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
			} else {
				otherSignups[signup.signup].push(signup.character.name);
			}

			// Store our signup for the next iteration
			prevSignup = signup;
		});

		// If we have at least one signup, add the embed field for the last signup class/role combo
		if (prevSignup) {
			embeds.push({
				'name': emojis[prevSignup.character.role] + ' ' + client.general.ucfirst(prevSignup.character.class), 
				'signups': signups
			});
		}

		// Add our fields
		embeds.forEach((embedField) => {
			embed.addField(embedField.name, embedField.signups.join('\n'), true);
		});

		// keep an even number of rows
		if (embeds.length % 3 == 2) {
			embed.addField('-', '-', true);
		}

		let confirmedText = raid.confirmation ? '**Confirmed:** ' + confirmed + '\n' : '';
		let maybeText = otherSignups['maybe'].length ? '**Maybe:** ' + otherSignups['maybe'].join(', ') + '\n' : '';
		let noText = otherSignups['no'].length ? '**No:** ' + otherSignups['no'].join(', ') + '\n' : '';
		embed.addField('Sign-ups', 
			maybeText +
			noText +
			confirmedText + 
			'**Total:** ' + raid.signups.length + '\n'
		);

		if (raid.confirmation) {
			embed.addField('**Confirmation Mode**', 
				'Please note that confirmation mode has been enabled!\n' +
				'**Bold** names are currently confirmed for the raid. \n' +
				'*Italicized* names may or may not be brought to this raid.'
			);
		}

		if (raid.softreserve) {
			let softReserveText = "To reserve an item, use `+reserve PlayerName Full Item Name`\nTo see all current reserves, use `+reservelist`\nTo view items eligible for reserving, use `+reserveitems`";
			let raidHash = await client.models.raidHash.findOne({where: {memberID: raid.memberID, guildID: raid.guildID}});
			if (raidHash) {
				softReserveText += "\nYou can also manage your soft reserve at: http://goodbot.me/r/" + raid.id
			}
			embed.addField('**Soft Reserve**', softReserveText);
		}


		embed.setTimestamp();

		return embed;
	}
};