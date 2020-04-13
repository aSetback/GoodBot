const Discord = require("discord.js");

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

    if (args[0] == 'add') {
        args.shift();
        let name = args.shift().toLowerCase();
        let rules = args.join(' ');
        client.models.raidRules.findOne({where: {name: name, guildID: message.guild.id}}).then((raidRules) => {
            let record = {
                name: name,
                rules: rules,
                guildID: message.guild.id
            };
            if (raidRules) {
                client.models.raidRules.update(record, {where: {id: raidRules.id}});
            } else {
                client.models.raidRules.create(record);
            }
        });
    } else {
        let name = args.shift();
        client.models.raidRules.findOne({where: {name: name, guildID: message.guild.id}}).then((raidRules) => {
            if (raidRules) {
                message.channel.send(raidRules.rules);
            }
        });
    }

};