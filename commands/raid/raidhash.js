const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

    let hash = args.shift();
    client.models.raidHash.findOne({where: {memberID: message.author.id, guildID: message.guild.id}}).then((raidHash) => {
        if (raidHash) {
            client.models.raidHash.update({hash: hash}, {where: {id: raidHash.id}}).then(() => {
                client.messages.send(message.channel, "Your raid hash has been updated to: **" + hash + "**.", 240);
            })
        } else {
            client.models.raidHash.create({memberID: message.author.id, guildID: message.guild.id, hash: hash}).then(() => {
                client.messages.send(message.channel, "Your raid hash has been created: **" + hash + "**.", 240);
            });
        }
    });
};