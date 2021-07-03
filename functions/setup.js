const fs = require("fs");

module.exports = {
    run: (client) => {
        client.on('raw', async packet => {
            // Only parse emoji adds
            if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;

            // Determine if we're adding or removing the emoji
            let action = "add";
            if (packet.t == "MESSAGE_REACTION_REMOVE") {
                action = "remove";
            }

            // Ignore the bot emojis
    		if (packet.d.user_id.toString() == client.config.userId) return;

            let guild = client.guilds.cache.get(packet.d.guild_id);
            let channel = await client.channels.fetch(packet.d.channel_id);
            let emoji = packet.d.emoji;
        
            // Don't operate on DMs
            if (channel.type == 'dm') return;
            
            let member = await guild.members.fetch(packet.d.user_id);

            if (!member) {
                channel.send('[Error]: Could not find user ID: ' + packet.d.user_id + '.');
                return false;
            } 

            // Only parse emojis from these channels
            if (channel.name == 'select-your-class') {
                client.setup.selectClass(client, emoji, member, channel, action);    
            }
            if (channel.name == 'select-your-role') {
                client.setup.selectRole(client, emoji, member, channel, action);    
            }
            if (channel.name == 'select-your-faction') {
                client.setup.selectFaction(client, emoji, member, channel, action);    
            }
        });
    },
    selectFaction: async (client, emoji, member, channel, action) => {
        let faction = '';
        // Translate emoji name
        if (emoji.name == 'GoodBotAlliance') {
            faction = 'Alliance';
        }

        if (emoji.name == 'GoodBotHorde') {
            faction = 'Horde';
        }

        // A faction emoji wasn't selected
        if (!faction) {
            return false;
        }

        // Check if a discord role exists for this emoji
        let role = channel.guild.roles.cache.find(role => role.name.toLowerCase() === faction.toLowerCase());
        member = await channel.guild.members.fetch(member.user.id);
        if (role) {
            if (action == 'add') {
                await member.roles.add(role.id).catch((e) => { console.error('Add role failed, no permission')});
                client.setup.checkCompleteness(client, member);
                client.log.write(client, member, channel, 'Faction Added: ' + faction);
            } else {
                await member.roles.remove(role.id)
                client.log.write(client, member, channel, 'Faction Removed: ' + faction);
            }
        }
    },
    selectClass: async (client, emoji, member, channel, action) => {
        member = await channel.guild.members.fetch(member.user.id);
        if (action != 'add') {
            return false;
        }

        let emojiName = emoji.name;
        if (emojiName.substring(0, 2) == 'GB') {
            emojiName = emojiName.substring(2, emojiName.length);
        }

        // Check if a discord role exists for this emoji
        let role = channel.guild.roles.cache.find(role => role.name.toLowerCase() === emojiName.toLowerCase());

        // Make an array of role objects for each of the classes
        let classes = ['warrior', 'paladin', 'shaman', 'hunter', 'rogue', 'druid', 'priest', 'warlock', 'mage'];
        let expansion = await client.guildOption.expansion(client, channel.guild.id);
        if (expansion >= 2) {
            classes.push('dk');
        }
        if (expansion >= 4) {
            classes.push('monk');
        }
        if (expansion >= 6) {
            classes.push('dh');
        }

        if (!classes.includes(emojiName.toLowerCase())) {
            console.log('Invalid emoji: ' + emojiName);
            return;
        }

        // Tag the player with the selected role, if it exists.
        if (role) {
            // Remove the selected role from the remove list
            classes.splice(classes.indexOf(role.name.toLowerCase()), 1);

            // Remove all other roles
            classes.forEach((memberClass) => {
                let memberRole = channel.guild.roles.cache.find(role => role.name.toLowerCase() === memberClass.toLowerCase());
                if (memberRole) {
                    member.roles.remove(memberRole);
                }
            });

            member.roles.add(role).then(() => {
                client.setup.checkCompleteness(client, member);
            }).catch((e) => { console.error('Add role failed, no permission')});
        }
        client.set.characterClass(client, channel.guild, member, member.displayName, emojiName);
        if (!role) {
            client.setup.checkCompleteness(client, member);
        }

        client.log.write(client, member, channel, 'Class Set: ' + client.general.ucfirst(emojiName));

    },
    selectRole: (client, emoji, member, channel, action) => {
        member = await channel.guild.members.fetch(member.user.id);
        if (action != 'add') {
            return false;
        }

        let emojiName = emoji.name;
        if (emojiName.substring(0, 2) == 'GB') {
            emojiName = emojiName.substring(2, emojiName.length);
        }

        // Make an array of role objects for each of the roles
        let roles = ['healer', 'tank', 'dps', 'caster'];

        if (!roles.includes(emojiName.toLowerCase())) {
            return;
        }

        // Check if a discord role exists for this emoji
        let role = channel.guild.roles.cache.find(role => role.name.toLowerCase() === emojiName.toLowerCase());

        // Tag the player with the selected role, if it exists.
        if (member && role) {
            // Remove the selected role from the remove list
            roles.splice(roles.indexOf(role.name.toLowerCase()), 1);

            // Remove all other roles
            roles.forEach((roleName) => {
                let memberRole = channel.guild.roles.cache.find(role => role.name.toLowerCase() === roleName.toLowerCase());
                if (memberRole) {
                    member.roles.remove(memberRole);
                }
            });

            member.roles.add(role).then(() => {
                client.setup.checkCompleteness(client, member);
            }).catch((e) => { console.error('Add role failed, no permission')});
        } else {

        }

        client.set.characterRole(client, channel.guild, member, member.displayName, emojiName);
        if (!role) {
            client.setup.checkCompleteness(client, member);
        }

        client.log.write(client, member, channel, 'Role Set: ' + client.general.ucfirst(emojiName));

    },
    nick: (client, message) => {
        setTimeout(() => {
            message.delete().catch(O_o=>{}); 
        }, 1000);
        let member = await channel.guild.members.fetch(message.author.id);
        
        // Make sure the name is valid
        let newName = client.general.ucfirst(message.content.trim());
        if (!client.set.validName(message.guild, newName)) {
            return message.author.send('Unable to set your name.  Please use only letters.');
        }

        client.log.write(client, message.member, message.channel, 'Set Nick: ' + newName);

        // UCFirst
        let result = message.guild.members.cache.get(message.author.id).setNickname(newName);  
        result.catch((e) => {
            message.author.send('Unable to set your name: ' + e.message);
            message.author.send('This generally happens when a player has a higher role than the bot - please note that the bot will never be able to change the nickname of the server owner.');
        });
        client.setup.checkCompleteness(client, member);
    },
    checkCompleteness: async function(client, member) {
        member = await channel.guild.members.fetch(member.user.id);
        let factionChannel = member.guild.channels.cache.find(c => c.name == "select-your-faction");
        let hasFaction = true;
        if (factionChannel) {
            hasFaction = client.set.hasFaction(member.guild, member);
        }
        let validName = client.set.validName(member.guild, member.displayName);
        let hasRole = await client.set.hasRole(client, member.guild, member.displayName);
        let hasClass = await client.set.hasClass(client, member.guild, member.displayName);
        if (hasFaction && validName && hasRole && hasClass) {
            client.setup.applyCompleteRole(client, member)
        }
    },
    applyCompleteRole: async (client, member) => {
        member = await channel.guild.members.fetch(member.user.id);

        let roleName = await client.customOptions.get(client, member.guild, 'completerole');
        if (!roleName) {
            return false;
        }
        let role = member.guild.roles.cache.find(role => role.name.toLowerCase() === roleName.toLowerCase());
        if (role) {
            member.roles.add(role).catch((e) => { console.error('Add role failed, no permission')});
        }

    }
}
