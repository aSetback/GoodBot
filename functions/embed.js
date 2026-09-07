const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
	update: async (client, channel) => {
		// update() is called fire-and-forget (no await, no .catch()) from
		// ~20 places across the codebase, so a thrown/rejected error here
		// becomes an unhandled promise rejection -- and since nothing else
		// ever retries a signup that already went through, that leaves the
		// raid's embed stuck without ever updating again. Catch everything
		// here instead of relying on every call site to do so.
		try {
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
						client.embed.edit(client, raidChannel, embed, raid).catch((error) => {
							console.error('Failed to edit raid embed', error);
						});
						if (crosspostChannel) {
							client.embed.edit(client, crosspostChannel, embed, raid).catch((error) => {
								console.error('Failed to edit crossposted raid embed', error);
							});
						}
						client.embeds[raid.id].timeout = null;
					}, 1000)
				};
			}
		} catch (error) {
			console.error('Failed to update raid embed', error);
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

		// Look up each class/role emoji independently so one missing emoji
		// (e.g. a role emoji not yet created on a given server) doesn't blank
		// out every other emoji too -- the previous single try/catch around
		// the whole object made the whole thing fail as soon as any one
		// .find() came back undefined.
		const getEmoji = (name) => client.emojis.cache.find(emoji => emoji.name === name)?.toString() ?? "";
		let emojis = {
			"warrior": getEmoji("GBwarrior"),
			"druid": getEmoji("GBdruid"),
			"paladin": getEmoji("GBpaladin"),
			"priest": getEmoji("GBpriest"),
			"mage": getEmoji("GBmage"),
			"warlock": getEmoji("GBwarlock"),
			"rogue": getEmoji("GBrogue"),
			"hunter": getEmoji("GBhunter"),
			"shaman": getEmoji("GBshaman"),
			"dk": getEmoji("GBdk"),
			"monk": getEmoji("GBmonk"),
			"dh": getEmoji("GBdh"),
			"evoker": getEmoji("GBevoker"),
			"tank": getEmoji("GBtank"),
			"healer": getEmoji("GBhealer"),
			"dps": getEmoji("GBdps"),
			"caster": getEmoji("GBcaster"),
		};

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
		let embeds = []; // one field per role+class -- the preferred, more granular breakdown
		let roleSignups = {'tank': [], 'healer': [], 'dps': [], 'caster': []}; // one bucket per role -- the fallback grouping
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
				roleSignups[signup.character.role].push(signupString);

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

		// One field per role instead of per role+class -- used only as a
		// fallback below when the per-class breakdown would push the embed
		// past Discord's 25-field cap (a raid with a wide spread of classes
		// signed up can easily produce more than 25 role+class
		// combinations, which throws inside addFields() and leaves the
		// embed stuck without ever updating again for that raid).
		const roleFields = ['tank', 'healer', 'dps', 'caster']
			.filter(role => roleSignups[role].length > 0)
			.map(role => ({name: emojis[role] + ' ' + client.general.ucfirst(role), signups: roleSignups[role]}));

		const nonClassFieldCount = embedFields.length;
		const trailingFieldCount = 1 + (raid.confirmation ? 1 : 0) + (raid.softreserve ? 1 : 0); // Sign-ups, Confirmation Mode, Soft Reserve
		const classFieldCount = embeds.filter(e => e.signups.length > 0).length;
		const classPadding = classFieldCount % 3 == 2 ? 1 : 0;
		const wouldExceedFieldCap = (nonClassFieldCount + classFieldCount + classPadding + trailingFieldCount) > 25;

		const roleOrClassFields = wouldExceedFieldCap ? roleFields : embeds;

		// Add our fields
		roleOrClassFields.forEach((embedField) => {
			if (embedField.signups.length > 0) {
				embedFields.push({name: embedField.name, value: embedField.signups.join('\n'), inline: true});
			}
		});

		// keep an even number of rows
		if (roleOrClassFields.length % 3 == 2) {
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
			// Not real access control -- the website just declines to resolve
			// a bare raid ID, so this deters casually paging through them.
			let reserveToken = Buffer.from(raid.id + ':' + raid.memberID).toString('base64url');
			softReserveText += "\nYou can also manage your soft reserve at: https://goodbot.me/r/" + reserveToken;
			embedFields.push({name: '**Soft Reserve**', value: softReserveText});
		}

		embed.addFields(embedFields);
		embed.setTimestamp();

		return embed;
	}
};