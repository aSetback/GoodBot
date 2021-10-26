const fs = require("fs");

module.exports = {
	set: async function(type, name, channel, message, client) {
        if (!message.guild.id) {
            return client.messages.send(message.channel, 'This can only be used in a sign-up channel.', 240);
        }
        if (type === '+') {
            signValue = 'yes';
        } else if (type === '-') {
            signValue = 'no';
        } else if (type.toLowerCase() === 'm') {
            signValue = 'maybe';
        }

        let characterName = client.general.ucfirst(name);
        let member = message.guild.members.cache.find(member => member.nickname == characterName ||  member.user.username == characterName);
        let raid = await client.raid.get(client, message.channel);

        // Locked raid handling
        if (raid && raid.locked) {
            if (client.config.userId != message.author.id) {
                return message.author.send('This raid is locked -- sign-ups can no longer be modified.');
            } else {
                return client.messages.send(message.channel, 'This raid is locked -- sign-ups can no longer be modified.', 240);
z           }
        }
        
        let playerId = null;
        if (member) {
            playerId = member.user.id.toString();
        }

        // Check to make sure class & role is set
        let character = await client.set.getCharacter(client, message.guild, characterName);
        if (!character && raid.crosspostID && raid.crosspostID.length) {
            let otherChannel;
            if (message.channel.id == raid.channelID) {
                otherChannel = await client.channels.cache.find(c => c.id == raid.crosspostID);
            } else {
                otherChannel = await client.channels.cache.find(c => c.id == raid.channelID);
            }
            character = await client.set.getCharacter(client, otherChannel.guild, characterName);
        }

        // Check if the player is avlid
        if (!client.set.validName(characterName)) {
            let playerMessage = 'Unable to sign "' + characterName + '" for this raid.  Please set your in-game name using +nick first.';
            if (playerId) {
                playerMessage = '<@' + playerId + '> ' + playerMessage;
            }
            return client.messages.errorMessage(message.channel, playerMessage, 240);
        }

        // Verify class is set
        if (!character.class) {
            let playerMessage = 'Unable to sign "' + characterName + '" for this raid, character\'s class is not set.';
            if (playerId) {
                playerMessage = '<@' + playerId + '> ' + playerMessage;
            }
            return client.messages.errorMessage(message.channel, playerMessage, 240);
        }

        // Verify role is set
        if (!character.role) {
            let playerMessage = 'Unable to sign "' + characterName + '" for this raid, character\'s role is not set.';
            if (playerId) {
                playerMessage = '<@' + playerId + '> ' + playerMessage;
            }
            return client.messages.errorMessage(message.channel, playerMessage, 240);
        }

        // Verify the player class & role is valid
        if (!client.set.validCombo(character)) {
            let playerMessage = 'Could not sign  "' + characterName + '" for this raid, ' + character.class + '/' + character.role + ' is not a valid combination.';
            return client.messages.errorMessage(message.channel, playerMessage, 240);
        }

        // Save our sign-up to the db
        if (raid) {

            let record = {
                'player': characterName,
                'signup': signValue,
                'raidID': raid.id,
                'characterID': character.id,
                'channelID': raid.channelID,
                'guildID': raid.guildID,
                'memberID': message.author.id
            };

            client.models.signup.findOne({ where: {'player': characterName, 'raidID': raid.id}, order: [['createdAt', 'DESC']], group: ['player']}).then((signup) => {
                if (!signup) {
                    client.models.signup.create(record).then(() => {
                        // Update embed
                        client.embed.update(client, message.channel);
                    });
                } else {
                    client.models.signup.update(record, {
                        where: {
                            id: signup.id
                        }
                    }).then(() => {
                        // Update embed
                        client.embed.update(client, message.channel);
                    });
                }
            });
        }

        let logMessage = 'Sign Up: ' + characterName + ' => ' + signValue;
        client.log.write(client, message.author, message.channel, logMessage);
    },
    remove(client, raidID, characterName) {
        let promise = new Promise((resolve, reject) => {
            client.models.signup.findOne({where: {player: characterName, raidID: raidID}}).then((signup) => {
                // Only delete the sign-up if it exists.
                if (signup) {
                    client.models.signup.destroy({ where: {raidID: raidID, player: characterName}}).then(() => {
                        resolve(true);
                    });
                } else {
                    resolve(false);
                }
            });
        });
        return promise;
    },
    confirm(client, raidID, characterName) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                confirmed: true
            };
            client.models.signup.findOne({where: {player: characterName, raidID: raidID, signup: 'yes'}}).then((signup) => {
                if (!signup) {
                    resolve(false);
                } else {
                    client.models.signup.update(record, {
                        where: {
                            id: signup.id
                        }
                    }).then((rows) => {
                        resolve(true);
                    });
                }
            });
        });
        return promise;
    },
    unconfirm(client, raidID, characterName) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                confirmed: false
            };
            client.models.signup.findOne({where: {player: characterName, raidID: raidID}}).then((signup) => {
                if (!signup) {
                    resolve(false);
                } else {
                    client.models.signup.update(record, {
                        where: {
                            id: signup.id
                        }
                    }).then((rows) => {
                        resolve(true);
                    });
                }
            });
        });
        return promise;
    },
    getSignups(client, raid) {
        let promise = new Promise((resolve, reject) => {
            let includes = [
                { model: client.models.character, as: 'character', foreignKey: 'characterID' }
            ];

            client.models.signup.findAll({ where: {'raidID': raid.id}, include: includes }).then((signups) => {
                resolve(signups);
            });
        });
        return promise;
    },
    getConfirmed(client, raid) {
        let promise = new Promise((resolve, reject) => {
            client.models.signup.findAll({ where: {'raidID': raid.id, confirmed: 1}}).then((signups) => {
                resolve(signups);
            });
        });
        return promise;
    }

}