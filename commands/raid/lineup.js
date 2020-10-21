const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

    let raid = await client.raid.get(client, message.channel);
    message.author.send('http://goodbot.me/raids/lineup/' + raid.id);
};