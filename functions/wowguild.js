module.exports = {
    addGuild: (client, name, faction, channel) => {
        client.models.wowGuild.findOne({where: {name: name, guildID: channel.guild.id}}).then((guildInfo) => {
            if (guildInfo) {
                return client.messages.errorMessage(channel, 'Guild **' + name + '** already exists.', 240);
            }
            client.models.wowGuild.create({'name': name, 'faction': faction, guildID: channel.guild.id}).then((guild) => {
                return client.messages.send(channel, 'Guild **' + name + '** has been created on **' + faction + '** (ID: ' + guild.id + ')', 240);
            });
        });
    },
    removeGuild: (client, name, channel) => {
        client.models.wowGuild.findOne({where: {name: name, guildID: channel.guild.id}}).then((guildInfo) => {
            if (!guildInfo) {
                return client.messages.errorMessage(channel, 'Guild **' + name + '** does not exist.', 240);
            }
            client.models.wowGuild.destroy({'where': {'id': guildInfo.id}}).then(() => {
                return client.messages.send(channel, 'Guild **' + name + '** has been removed. (ID: ' + guildInfo.id + ')', 240);
            });
        });
    },
    addOfficers: (client, wowGuildID, officers, channel) => {
        officers.forEach((officerName) => {
            officerName = client.general.ucfirst(officerName);
            client.models.wowOfficer.findOne({where: {id: wowGuildID, name: officerName}}).then((officerInfo) => {
                if (officerInfo) { 
                    return client.messages.errorMessage(channel, 'Officer **' + officerName + '** already exists for this guild.', 240);
                }
                client.models.wowOfficer.create({'name': officerName, wowGuildID: wowGuildID, guildID: channel.guild.id}).then(() => {
                    return client.messages.send(channel, 'Officer **' + officerName + '** has been added.', 240);
                });
            });
        });
    },
    removeOfficers: (client, wowGuildID, officers, channel) => {
        officers.forEach((officerName) => {
            officerName = client.general.ucfirst(officerName);
            client.models.wowOfficer.findOne({where: {name: officerName, wowGuildID: wowGuildID, guildID: channel.guild.id}}).then((officerInfo) => {
                if (!officerInfo) {
                    return client.messages.errorMessage(channel, 'Officer **' + name + '** does not exist.', 240);
                }
                client.models.wowOfficer.destroy({'where': {'id': officerInfo.id}}).then(() => {
                    return client.messages.send(channel, 'Officer **' + officerName + '** has been removed.', 240);
                });
            });
        });
    },
    addGM: (client, wowGuildID, GMs, channel) => {
        GMs.forEach((guildMasterName) => {
            guildMasterName = client.general.ucfirst(guildMasterName);
            client.models.wowGuildMaster.findOne({where: {id: wowGuildID, name: guildMasterName, guildID: channel.guild.id}}).then((officerInfo) => {
                if (officerInfo) { 
                    return client.messages.errorMessage(channel, 'Guild Master **' + guildMasterName + '** already exists for this guild.', 240);
                }
                client.models.wowGuildMaster.create({'name': guildMasterName, wowGuildID: wowGuildID, guildID: channel.guild.id}).then(() => {
                    return client.messages.send(channel, 'Guild Master **' + guildMasterName + '** has been added.', 240);
                });
            });
        });
    },
    removeGM: (client, wowGuildID, GMs, channel) => {
        GMs.forEach((guildMasterName) => {
            guildMasterName = client.general.ucfirst(guildMasterName);
            client.models.wowGuildMaster.findOne({where: {name: guildMasterName, wowGuildID: wowGuildID, guildID: channel.guild.id}}).then((officerInfo) => {
                if (!officerInfo) {
                    return client.messages.errorMessage(channel, 'Guild Master **' + guildMasterName + '** does not exist.', 240);
                }
                client.models.wowGuildMaster.destroy({'where': {'id': officerInfo.id}}).then(() => {
                    return client.messages.send(channel, 'Guild Master **' + guildMasterName + '** has been removed.', 240);
                });
            });
        });
    },
    findGuild: (client, name, channel) => {
        client.models.wowGuild.findOne({where: {name: name, guildID: channel.guild.id}}).then((guildInfo) => {
            if (!guildInfo) {
                return client.messages.errorMessage(channel, 'Guild **' + name + '** does not exist.', 240);
            }
            return client.messages.send(channel, '**ID: **' + guildInfo.id + '** Guild: **' + guildInfo.name + ', **Faction: **' + client.general.ucfirst(guildInfo.faction), 240);
        });
    },
    listGuilds: (client, faction, channel, serverID) => {
        let includes = [
            {model: client.models.wowGuildMaster, as: 'gm', foreignKey: 'wowGuildID'},
            {model: client.models.wowOfficer, as: 'officer', foreignKey: 'wowGuildID'},
        ];
        let guildID = serverID ? serverID : channel.guild.id;
        let where = {     
            guildID: guildID
        };
        if (faction) {
            where.faction = faction;
        }

        client.models.wowGuild.findAll({where: where, include: includes, order: [['name', 'ASC']]}).then((guilds) => {
            let returnMessage = '```diff\n';
            for (key in guilds) {
                if (returnMessage.length > 1700) {
                    returnMessage += '```';
                    channel.send(returnMessage);
                    returnMessage = '```diff\n';
                }

                let guild = guilds[key];
                let guildMasters = [];
                let officers = [];
                for (gmKey in guild.gm) {
                    guildMasters.push(guild.gm[gmKey].name);                   
                }
                for (officerKey in guild.officer) {
                    officers.push(guild.officer[officerKey].name);                   
                }
                returnMessage += '<' + guild.name + '>\n';
                returnMessage += '+ GM: ' + guildMasters.join(', ') + '\n';
                returnMessage += '- Officers: ' + officers.join(', ') + '\n\n';
            }
            returnMessage += '```';
            channel.send(returnMessage);
        });
    }
}