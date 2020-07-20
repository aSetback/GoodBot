module.exports = {
    addGuild: (client, name, faction, channel) => {
        client.models.wowGuild.findOne({where: {name: name, guildID: channel.guild.id}}).then((guildInfo) => {
            if (guildInfo) {
                return client.messages.errorMessage(channel, 'Guild "' + name + '" already exists.', 240);
            }
            client.models.wowGuild.create({'name': name, 'faction': faction, guildID: channel.guild.id}).then((guild) => {
                return client.messages.send(channel, 'Guild "' + name + '" has been created on *' + faction + '* (ID: ' + guild.id + ')', 240);
            })
        });
    },
    removeGuild: (client, name, channel) => {
        client.models.wowGuild.findOne({where: {name: name, guildID: channel.guild.id}}).then((guildInfo) => {
            if (!guildInfo) {
                return client.messages.errorMessage(channel, 'Guild "' + name + '" does not exist.', 240);
            }
            client.models.wowGuild.destroy({'where': {'id': guildInfo.id}}).then(() => {
                return client.messages.send(channel, 'Guild "' + name + '" has been removed. (ID: ' + guildInfo.id + ')', 240);
            })
        });
    },
    addOfficers: (client, wowGuildID, officers, channel) => {

    },
    removeOfficers: (client, wowGuildID, officers, channel) => {

    },
    addGM: (client, wowGuildID, GMs, channel) => {

    },
    removeGM: (client, wowGuildID, GMs, channel) => {

    },
    findGuild: (client, name, channel) => {
        client.models.wowGuild.findOne({where: {name: name, guildID: channel.guild.id}}).then((guildInfo) => {
            if (!guildInfo) {
                return client.messages.errorMessage(channel, 'Guild "' + name + '" does not exist.', 240);
            }
            return client.messages.send(channel, '**ID: **' + guildInfo.id + '** Guild: **' + guildInfo.name + ', **Faction: **' + client.general.ucfirst(guildInfo.faction), 240);
        });
    },
    listGuilds: (client, faction, channel) => {
        client.models.wowGuild.findAll({where: {guildID: channel.guild.id}}).then((guilds) => {
            let returnMessage = '```\n';
            for (key in guilds) {
                returnMessage += guilds[key].id.toString().padEnd(12) + guilds[key].name.padEnd(40) + client.general.ucfirst(guilds[key].faction).padEnd(20) + '\n';
            }
            returnMessage += '```';
            return client.messages.send(channel, returnMessage, 240);
        });
    }
}