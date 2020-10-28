const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

	let leader = args.shift();
	let raid = await client.raid.get(client, message.channel);
	let memberID = null;
	if (leader.substr(0, 2) == '<@') {
		memberID = leader.substr(2, leader.length-3);
	} else {
		var member = await message.guild.members.cache.find((member) => (member.nickname && member.nickname.toLowerCase() == leader.toLowerCase()));
		// if you can't find by nickname, check username
		if (!member) {
			member = await message.guild.members.cache.find(member => member.user.username.toLowerCase() == leader.toLowerCase());
		}

		if (member) {
			memberID = member.id;
		}
	}
	
	if (!memberID) {
		client.messages.errorMessage(message.channel, "Could not find player **" + leader + "**.", 240);
		return false;
	}
	
	memberID = memberID.replace('!', '');

	// Update our raider leader member ID
	await client.raid.addLeader(client, raid, memberID)

	// Update our embed
	client.embed.update(client, message.channel);
};