const fs = require("fs");

module.exports = {
    playerClass: (client, guild, member, player, className) => {
        className = className.toLowerCase();

        const validClasses = ['priest', 'paladin', 'druid', 'warrior', 'rogue', 'hunter', 'mage', 'warlock', 'shaman', 'dk'];
        if (validClasses.indexOf(className) < 0) {
            return false
        }
        
        let guildID = guild
        if (typeof guild == 'object')
            guildID = guild.id;

        let memberID = member
        if (typeof member == 'object')
            memberID = member.id;
    

        let record = {
            player: player,
            class: className,
            memberID: memberID,
            guildID: guildID
        };
    
        client.models.playerClass.findOne({ where: {'player': player, 'guildID': guildID}}).then((playerClass) => {
            if (!playerClass) {
                client.models.playerClass.create(record);
            } else {
                client.models.playerClass.update(record, {
                    where: {
                        id: playerClass.id
                    }
                });
            }
        });

        return true;
    },
    playerRole: (client, guild, member, player, roleName) => {
        roleName = roleName.toLowerCase();
        const validRoles = ['tank', 'healer', 'dps', 'caster'];
        if (validRoles.indexOf(roleName) < 0) {
            return false
        }
        
        let guildID = guild
        if (typeof guild == 'object')
            guildID = guild.id;

        let memberID = member
        if (typeof member == 'object')
            memberID = member.id;
    

        let record = {
            player: player,
            role: roleName,
            memberID: memberID,
            guildID: guildID
        };
        
        client.models.playerRole.findOne({ where: {'player': player, 'guildID': guildID}}).then((playerRole) => {
            if (!playerRole) {
                client.models.playerRole.create(record);
            } else {
                client.models.playerRole.update(record, {
                    where: {
                        id: playerRole.id
                    }
                });
            }
        });
        
        return true;
    },
    hasClass: (client, guild, player) => {
        let promise = new Promise((resolve, reject) => {
            client.models.playerClass.findOne({ where: {'player': player, 'guildID': guild.id}}).then((playerClass) => {
                if (playerClass) {
                    resolve(playerClass);
                } else {
                    resolve(false);
                }
            });
        });
        return promise;
    },
    hasRole: (client, guild, player) => {
        let promise = new Promise((resolve, reject) => {
            client.models.playerRole.findOne({ where: {'player': player, 'guildID': guild.id}}).then((playerRole) => {
                if (playerRole) {
                    resolve(playerRole);
                } else {
                    resolve(false);
                }
            });
        });
        return promise;
    },
    hasFaction: (client, member) => {
        let horde = member.guild.roles.find(role => role.name.toLowerCase() === 'horde');
        let alliance = member.guild.roles.find(role => role.name.toLowerCase() === 'alliance');
        if (member.roles.has(horde.id) || member.roles.has(alliance.id)) {
            return true;
        }
        return false;
    },
    validName: (guild, player) => {
        var reg = /^[a-zàâäåªæÆçÇœŒÐéèêëËƒíìîïÏñÑóòôöºúùûÜýÿ]+$/i;
        if (!reg.test(player)) {
            return false;
        }
        return true;
    },
}
