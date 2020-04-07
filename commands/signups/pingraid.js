const fs = require("fs");

exports.run = async function(client, message, args) {
	let raid = await client.signups.getRaid(client, message.channel);
	let signups = await client.signups.getSignups(client, raid);

	message.guild.fetchMembers().then(async function(guild) {
		mentionText = '';
		for (key in signups) {
			let signup = signups[key];
			if (signup.signup == 'yes') {
				// Try to find by nickname first
				var member = guild.members.find(member => member.nickname == signup.player);
				
				// if you can't find by nickname, check username
				if (!member) {
					member = guild.members.find(member => member.user.username == signup.player);
				}

				if (!member) {
					member = await getMain(client, signup.player, message.guild);
				}
				
				let playerId = null;
				if (member) {
					playerId = member.user.id;
				} else {
					console.log('Could not find ' + signup.player);
				}
				mentionText += '<@' + playerId + '> ';
			}
		}

		message.channel.send(mentionText);
	});
}

function getMain(client, character, guild) {
	let promise = new Promise((resolve, reject) => {
		client.models.character.findOne({where: {name: character, guildID: guild.id}}).then((character) => {
			if (character && character.mainID) {
				client.models.character.findOne({where: {id: character.mainID}}).then((main) => {
					let member = guild.members.find(member => member.nickname == main.name);
					if (!member) {
						member = guild.members.find(member => member.user.username == main.name);
					}

					if (member) {
						resolve(member);
					} else {
						resolve(false);
					}
				});
			} else {
				resolve(false);
			}
		});
	});
	return promise;
}