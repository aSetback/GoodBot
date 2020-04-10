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

        let characterName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        let member = message.guild.members.find(member => member.nickname == characterName ||  member.user.username == characterName);
        let playerId = null;
        if (member) {
            playerId = member.user.id.toString();
        }

        // Check to make sure class & role is set
        let character = await client.set.getCharacter(client, message.guild, characterName);

        // Check if the player is avlid
        if (!client.set.validName(characterName)) {
            let playerMessage = 'Unable to sign "' + characterName + '" for this raid.  Please set your in-game name using +nick first.';
            if (playerId) {
                playerMessage = '<@' + playerId + '> ' + playerMessage;
            }
            return playerMessage;
        }

        // Verify class is set
        if (!character.class) {
            let playerMessage = 'Unable to sign "' + characterName + '" for this raid, character\'s class is not set.';
            if (playerId) {
                playerMessage = '<@' + playerId + '> ' + playerMessage;
            }
            return message.channel.send(playerMessage);
        }

        // Verify role is set
        if (!character.role) {
            let playerMessage = 'Unable to sign "' + characterName + '" for this raid, character\'s role is not set.';
            if (playerId) {
                playerMessage = '<@' + playerId + '> ' + playerMessage;
            }
            return message.channel.send(playerMessage);
        }

        // Verify the player class & role is valid
        if (!client.set.validCombo(character)) {
            return message.channel.send('Could not sign  "' + characterName + '" for this raid, ' + character.class + '/' + character.role + ' is not a valid combination.');
        }

        // Save our sign-up to the db
        client.models.raid.findOne({'where': {'guildID': message.guild.id, 'channelID': message.channel.id}}).then((raid) => {
            if (raid) {
                let record = {
                    'player': characterName,
                    'signup': signValue,
                    'raidID': raid.id,
                    'channelID': raid.channelID,
                    'guildID': raid.guildID,
                    'memberID': message.author.id
                };

                client.models.signup.findOne({ where: {'player': characterName, 'raidID': raid.id}, order: [['createdAt', 'DESC']], group: ['player']}).then((signup) => {
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

        let logMessage = 'Sign Up: ' + characterName + ' => ' + signValue;
        client.log.write(client, message.author, message.channel, logMessage);
    },
    confirm(client, raidID, characterName) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                confirmed: true
            };
            client.models.signup.update(record, {
                where: {
                    raidID: raidID,
                    player: characterName
                }
            }).then(() => {
                resolve(true);
            });
        });
        return promise;
    },
    unconfirm(client, raidID, characterName) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                confirmed: false
            };
            client.models.signup.update(record, {
                where: {
                    raidID: raidID,
                    player: characterName
                }
            }).then(() => {
                resolve(true);
            });
        });
        return promise;
    },
    getRaid(client, channel) {
        let promise = new Promise((resolve, reject) => {
            client.models.raid.findOne({ where: {'channelID': channel.id}}).then((raid) => {
                resolve(raid);
            });
        });
        return promise;
    },
    getSignups(client, raid) {
        let promise = new Promise((resolve, reject) => {
            client.models.signup.findAll({ where: {'raidID': raid.id}}).then((signups) => {
                resolve(signups);
            });
        });
        return promise;
    }
}