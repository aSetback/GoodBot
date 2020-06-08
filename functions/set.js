const fs = require("fs");

module.exports = {
    characterClass: (client, guild, member, characterName, className) => {
        const validClasses = ['priest', 'paladin', 'druid', 'warrior', 'rogue', 'hunter', 'mage', 'warlock', 'shaman', 'dk'];
        className = className.toLowerCase();

        let guildID = guild
        if (typeof guild == 'object')
            guildID = guild.id;

        let memberID = member
        if (typeof member == 'object')
            memberID = member.id;
    

        let record = {
            name: client.general.ucfirst(characterName),
            class: className,
            memberID: memberID,
            guildID: guildID
        };
    
        let promise = new Promise((resolve, reject) => {
            if (validClasses.indexOf(className) < 0) {
                resolve(false);
            }
    
            client.models.character.findOne({ where: {'name': characterName, 'guildID': guildID}}).then((character) => {
                if (!character) {
                    client.models.character.create(record).then((character) => {
                        resolve(character.id);
                    });

                } else {
                    client.models.character.update(record, {
                        where: {
                            id: character.id
                        }
                    });
                    resolve(character.id);
                }
            });
        });
        
        return promise;
    },
    characterRole: (client, guild, member, characterName, roleName) => {
        const validRoles = ['tank', 'healer', 'dps', 'caster'];
        roleName = roleName.toLowerCase();
       
        let guildID = guild
        if (typeof guild == 'object')
            guildID = guild.id;

        let memberID = member
        if (typeof member == 'object')
            memberID = member.id;
    

        let record = {
            name: client.general.ucfirst(characterName),
            role: roleName,
            memberID: memberID,
            guildID: guildID
        };
        
        let promise = new Promise((resolve, reject) => {
            if (validRoles.indexOf(roleName) < 0) {
                resolve(false);
            }
    
            client.models.character.findOne({ where: {'name': characterName, 'guildID': guildID}}).then((character) => {
                if (!character) {
                    client.models.character.create(record).then((character) => {
                        resolve(character.id);
                    });

                } else {
                    client.models.character.update(record, {
                        where: {
                            id: character.id
                        }
                    });
                    resolve(character.id);
                }
            });
        });
        
        return promise;
    },
    hasClass: (client, guild, player) => {
        let promise = new Promise((resolve, reject) => {
            client.models.character.findOne({ where: {'name': player, 'guildID': guild.id}}).then((character) => {
                if (character) {
                    resolve(character.class);
                } else {
                    resolve(false);
                }
            });
        });
        return promise;
    },
    hasRole: (client, guild, player) => {
        let promise = new Promise((resolve, reject) => {
            client.models.character.findOne({ where: {'name': player, 'guildID': guild.id}}).then((character) => {
                if (character) {
                    resolve(character.role);
                } else {
                    resolve(false);
                }
            });
        });
        return promise;
    },
    getCharacter: (client, guild, characterName) => {
        let promise = new Promise((resolve, reject) => {
            client.models.character.findOne({ where: {'name': characterName, 'guildID': guild.id}}).then((character) => {
                if (character) {
                    resolve(character);
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
        var reg = /^[a-zàâäåªæÆçÇœŒÐéèêëËƒíìîïÏñÑóòôöõºúùûÜýÿß]+$/i;
        if (!reg.test(player)) {
            return false;
        }
        return true;
    },
    validCombo: (character) => {
        const validCombos = [
            'warrior-tank',
            'warrior-dps',
            'hunter-dps',
            'rogue-dps',
            'mage-caster',
            'warlock-caster',
            'priest-healer',
            'paladin-healer',
            'druid-healer',
            'druid-caster',
            'druid-dps',
            'druid-tank',
            'priest-caster',
            'paladin-dps',
            'paladin-tank',
            'shaman-dps',
            'shaman-caster',
            'shaman-healer',
            'dk-dps',
            'dk-tank'
        ];

        let playerCombo = character.class.toLowerCase() + '-' + character.role.toLowerCase();
        return validCombos.includes(playerCombo);
    }
}
