const fs = require("fs");

module.exports = {
	set: async function(type, name, channel, message, client) {
        if (!message.guild.id) {
            return channel.send('This can only be used in a sign-up channel.');
        }
        if (type === '+') {
            signValue = 'yes';
        } else if (type === '-') {
            signValue = 'no';
        } else if (type.toLowerCase() === 'm') {
            signValue = 'maybe';
        }

        const userName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        let member = message.guild.members.find(member => member.nickname == userName ||  member.user.username == userName);
        let playerId = null;
        if (member) {
            playerId = member.user.id.toString();
        }

        // Check if the player is avlid
        var reg = /^[a-zàâäåªæÆçÇœŒÐéèêëËƒíìîïÏñÑóòôöºúùûÜýÿ]+$/i;
        if (!client.set.validName(userName)) {
            let playerMessage = 'Unable to sign "' + userName + '" for this raid.  Please set your in-game name using +nick first.';
            if (playerId) {
                playerMessage = '<@' + playerId + '> ' + playerMessage;
            }
            return playerMessage;
        }

        // Check to make sure class & role is set
        let playerRole = await client.set.hasRole(client, message.guild, userName);
        let playerClass = await client.set.hasClass(client, message.guild, userName);

        // Either class or 
        let unsavedSettings = false;
        if ((!playerRole || !playerClass) && member) {
            playerClass = getClassByTag(member);
            playerRole = getRoleByTag(member);
            unsavedSettings = true;
        }

        if (!playerClass) {
            let playerMessage = 'Unable to sign "' + userName + '" for this raid.  Player class is not set.';
            if (playerId) {
                playerMessage = '<@' + playerId + '> ' + playerMessage;
            }
            return message.channel.send(playerMessage);
        }

        if (!playerRole) {
            let playerMessage = 'Unable to sign "' + userName + '" for this raid.  Player role is not set.';
            if (playerId) {
                playerMessage = '<@' + playerId + '> ' + playerMessage;
            }
            return message.channel.send(playerMessage);
        }

        if (unsavedSettings) {
            if ((playerClass == 'Mage' || playerClass == 'Warlock' || playerClass == 'Priest' || playerClass == 'Druid') && playerRole == 'RDPS') {
                playerRole = 'Caster';
            }
            if (playerRole == 'RDPS' || playerRole == 'MDPS') {
                playerRole = 'DPS';
            }
            if (playerRole == 'Heal') {
                playerRole = 'Healer';
            }

            client.set.playerClass(client, message.guild, member, userName, playerClass)
            client.set.playerRole(client, message.guild, member, userName, playerRole)
        }

        // Save our sign-up to the db
        client.models.raid.findOne({'where': {'guildID': message.guild.id, 'channelID': message.channel.id}}).then((raid) => {
            if (raid) {
                let record = {
                    'player': userName,
                    'signup': signValue,
                    'raidID': raid.id,
                    'channelID': raid.channelID,
                    'guildID': raid.guildID,
                    'memberID': message.author.id
                };

                client.models.signup.findOne({ where: {'player': userName, 'raidID': raid.id}}).then((signup) => {
                    if (!signup) {
                        client.models.signup.create(record).then(() => {
                            // Update embed
                            client.embed.update(client, message, raid);
                        });
                    } else {
                        client.models.signup.update(record, {
                            where: {
                                id: signup.id
                            }
                        }).then(() => {
                            // Update embed
                            client.embed.update(client, message, raid);
                        });
                    }
                });
            }
        });

        let logMessage = 'Sign Up: ' + userName + ' => ' + signValue;
        client.log.write(client, message.author, message.channel, logMessage);

        function getClassByTag(member) {
            const validClasses = ['Priest', 'Paladin', 'Druid', 'Warrior', 'Rogue', 'Hunter', 'Mage', 'Warlock'];
            for (key in validClasses) {
                let localClass = validClasses[key];
                if (member.roles.some(role => role.name == localClass)) {
                    return localClass;
                }
            }
            return 'unknown';
        }

        function getRoleByTag(member) {
            const validRoles = ['Tank', 'Heal', 'MDPS', 'RDPS'];
            for (key in validRoles) {
                let localRole = validRoles[key];
                if (member.roles.some(role => role.name == localRole)) {
                    return localRole;
                }
            }
            return 'unknown';
        }
    }
}