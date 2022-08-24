const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent, SelectInputComponent } = require("discord.js");
const { Op } = require('sequelize');

module.exports = {
    createAlt: async (client, interaction) => {
        let charName = interaction.fields.getTextInputValue('altName');
        let className = interaction.fields.getTextInputValue('className');
        let roleName = interaction.fields.getTextInputValue('roleName');

        if (charName.length < 3) {
            return interaction.reply({content: '"' + charName + '" is not a valid character name.', ephemeral: true});
        }

        let characterClass = await client.set.characterClass(client, interaction.guild, interaction.member, charName, className);
        if (!characterClass) {
            return interaction.reply({content: className + ' is not a valid class.', ephemeral: true});
        }
        
        let characterRole = await client.set.characterRole(client, interaction.guild, interaction.member, charName, roleName);
        if (!characterRole) {
            return interaction.reply({content: roleName + ' is not a valid role.', ephemeral: true});
        }

        altName = client.general.ucfirst(charName);
        mainName = client.general.ucfirst(interaction.member.nickname ? interaction.member.nickname : interaction.user.username);
    
        client.models.character.findOne({where: {name: mainName, guildID: interaction.guild.id}}).then((mainCharacter) => {
            if (!mainCharacter) {
                return interaction.reply({content: 'Could not find main: ' + mainName, ephemeral: true});
            }
            client.models.character.findOne({where: {name: altName, guildID: interaction.guild.id}}).then((altCharacter) => {
                if (mainCharacter.mainID) {
                    client.models.character.update({mainID: null}, {where: {id: mainCharacter.id}});
                }
                client.models.character.update({mainID: mainCharacter.id}, {where: {id: altCharacter.id}}).then(() => {
                    client.signups.selectAlt(client, interaction, altCharacter.id);
                });
            });
        });		
    },
    altModal: async (client, interaction) => {
        let altModal = new Modal()
            .setCustomId('altModal')
            .setTitle('Set Up Alt');
        let nameInput = new TextInputComponent()
            .setCustomId('altName')
            .setLabel('Character Name')
            .setStyle('SHORT');
        let classInput = new TextInputComponent()
            .setCustomId('className')
            .setLabel('Class')
            .setStyle('SHORT');
        let roleInput = new TextInputComponent()
            .setCustomId('roleName')
            .setLabel('Role (Tank, Healer, Caster, DPS)')
            .setStyle('SHORT');

        let ActionRow1 = new MessageActionRow().addComponents(nameInput);
        let ActionRow2 = new MessageActionRow().addComponents(classInput);
        let ActionRow3 = new MessageActionRow().addComponents(roleInput);
        altModal.addComponents([ActionRow1, ActionRow2, ActionRow3]);
        
        await interaction.showModal(altModal);
    },
    selectAlt: async (client, interaction, altID) => {
        let mainName = client.general.ucfirst(interaction.member.nickname ? interaction.member.nickname : interaction.user.username);
        let main = await client.character.get(client, mainName, interaction.guild.id);
        let alts = await client.character.getAlts(client, main);
        let raid = await client.raid.get(client, interaction.channelId);
        let whereStatement = [{'player': mainName, 'raidID': raid.id}];
        for (key in alts) {
           let alt = alts[key]; 
            whereStatement.push({'player': alt.name, 'raidID': raid.id});
        }

        let signup = await client.models.signup.findOne({ where: {[Op.or]: whereStatement}, order: [['createdAt', 'DESC']], group: ['player']});
        let characterId = altID ? altID : interaction.values[0];
        let character = await client.models.character.findOne({ where: {id: characterId}});
        
        if (signup) {
            client.models.signup.update({'player': character.name, 'characterID': character.id}, {
                where: {
                    id: signup.id,                
                }
            }).then(() => {
                client.log.write(client, interaction.member, interaction.channel, 'Swap to Alt: ' + mainName + ' => ' + character.name + '.');

                // Update embed
                client.embed.update(client, interaction.channel);
            });
        }

        return interaction.reply({content: 'Your signup has been changed to ' + character.name + '.', ephemeral: true});
    },
    signupReply: async (client, interaction) => {
        const altSelect = new MessageSelectMenu();
        
        // Retrieve Player Name
        let playerName = interaction.member.nickname ? interaction.member.nickname : interaction.user.username;
        playerName = client.general.ucfirst(playerName);

        // Verify the player has a character
        let main = await client.character.get(client, playerName, interaction.guild.id);
        
        if (!main) {
            return false;
        }

        // Character doesn't exist, evidently.
        if (main.mainID) {
            main = await client.character.getByID(client, main.mainID);
        }
        let alts = await client.character.getAlts(client, main);
        altSelect.setCustomId('altSelect')
            .setPlaceholder("Select a character.");

        altSelect.addOptions([{
            label: main.name,
            description: client.general.ucfirst(main.class) + ' ' + client.general.ucfirst(main.role),
            value: main.id.toString()
        }]);

        
        for (key in alts) {
            let alt = alts[key];
            altSelect.addOptions([{
                label: alt.name,
                description: client.general.ucfirst(alt.class) + ' ' + client.general.ucfirst(alt.role),
                value: alt.id.toString()
            }]);
        }

        altSelect.addOptions([{
            label: 'New Character',
            description: 'Set up a new character for raid sign-ups.',
            value: 'new'
        }]);
        
        const messageRow = new MessageActionRow().addComponents(altSelect);

        return interaction.reply({content: 'You have signed up for this raid as ' + playerName + '.  Would you like to change signup to an alt?', ephemeral: true, components: [messageRow]});

    },
	set: async function(client, raid, character, type, userID) {
        type = type.substr(0, 1).toLowerCase();
        if (type == '+' || type == 'y') { type = 'yes'}
        if (type == '-' || type == 'n') { type = 'no'}
        if (type == 'm') { type = 'maybe'}

        let characterName = client.general.ucfirst(character);

        if (!raid) {
            return {result: -1, msg: "This can only be used in a sign-up channel."};
        }

        // Locked raid handling
        if (raid.locked) {
            return {result: -1, msg: "This raid is locked -- sign-ups can no longer be modified."};
        }
        
        // Check to make sure class & role is set
        character = await client.set.getCharacter(client, {id: raid.guildID}, characterName);
        if (!character && raid.crosspostID && raid.crosspostID.length) {
            let otherChannel;
            if (message.channel.id == raid.channelID) {
                otherChannel = await client.channels.cache.find(c => c.id == raid.crosspostID);
            } else {
                otherChannel = await client.channels.cache.find(c => c.id == raid.channelID);
            }
            character = await client.set.getCharacter(client, otherChannel.guild, characterName);
        }

        // Check if the player is valid
        if (!client.set.validName(characterName)) {
            let playerMessage = 'Unable to sign up "' + characterName + '" for this raid.  Please set your in-game name using +nick first.';
            return {result: -1, msg: playerMessage};
        }

        // Verify class is set
        if (!character.class) {
            let playerMessage = 'Unable to sign up "' + characterName + '" for this raid, character\'s class is not set.';
            return {result: -1, msg: playerMessage};
        }

        // Verify role is set
        if (!character.role) {
            let playerMessage = 'Unable to sign up "' + characterName + '" for this raid, character\'s role is not set.';
            return {result: -1, msg: playerMessage};
        }

        // Verify the player class & role is valid
        if (!client.set.validCombo(character)) {
            let playerMessage = 'Could not sign  "' + characterName + '" for this raid, ' + character.class + '/' + character.role + ' is not a valid combination.';
            return {result: -1, msg: playerMessage};
        }

        // Save our sign-up to the db
        let record = {
            'player': characterName,
            'signup': type,
            'raidID': raid.id,
            'characterID': character.id,
            'channelID': raid.channelID,
            'guildID': raid.guildID,
            'memberID': userID
        };
        
        let signup = await client.models.signup.findOne({ where: {'player': characterName, 'raidID': raid.id}, order: [['createdAt', 'DESC']], group: ['player']});
        if (!signup) {
            await client.models.signup.create(record);
        } else {
            await client.models.signup.update(record, {
                where: {
                    id: signup.id
                }
            });
        }
    
        return {result: 1};
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