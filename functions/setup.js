const fs = require("fs");

module.exports = {
    run: (client) => {
        client.on('raw', packet => {
            // Only parse emoji adds
            if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;

            // Determine if we're adding or removing the emoji
            let action = "add";
            if (packet.t == "MESSAGE_REACTION_REMOVE") {
                action = "remove";
            }

            // Ignore the bot emojis
    		if (packet.d.user_id.toString() == client.config.userId) return;

            let channel = client.channels.get(packet.d.channel_id);
            let emoji = packet.d.emoji;
            let member = channel.guild.members.get(packet.d.user_id);	

            // Don't operate on DMs
            if (!channel.guild) return;

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
    selectFaction: (client, emoji, member, channel, action) => {
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
        let role = channel.guild.roles.find(role => role.name.toLowerCase() === faction.toLowerCase());
    
        if (role) {
            if (action == 'add') {
                member.addRole(role).then(() => {
                    client.setup.checkCompleteness(client, member);
                });
                client.log.write(client, member, channel, 'Faction Added: ' + faction);
            } else {
                member.removeRole(role)
                client.log.write(client, member, channel, 'Faction Removed: ' + faction);
            }
        }
    },
    selectClass: (client, emoji, member, channel, action) => {
        if (action != 'add') {
            return false;
        }

        // Check if a discord role exists for this emoji
        let role = channel.guild.roles.find(role => role.name.toLowerCase() === emoji.name.toLowerCase());

        // Tag the player with the selected role, if it exists.
        if (role) {
            // Make an array of role objects for each of the classes
            let classes = ['warrior', 'paladin', 'shaman', 'hunter', 'rogue', 'druid', 'priest', 'warlock', 'mage'];
            // Remove the selected role from the remove list
            classes.splice(classes.indexOf(role.name.toLowerCase()), 1);
            // Remove all other roles
            classes.forEach((memberClass) => {
                let memberRole = channel.guild.roles.find(role => role.name.toLowerCase() === memberClass.toLowerCase());
                if (memberRole) {
                    member.removeRole(memberRole);
                }
            });

            member.addRole(role).then(() => {
                client.setup.checkCompleteness(client, member);
            });
        }

        client.set.characterClass(client, channel.guild, member, member.displayName, emoji.name);
        if (!role) {
            client.setup.checkCompleteness(client, member);
        }

        client.log.write(client, member, channel, 'Class Set: ' + emoji.name.toLowerCase());

    },
    selectRole: (client, emoji, member, channel, action) => {
        if (action != 'add') {
            return false;
        }

        // Check if a discord role exists for this emoji
        let role = channel.guild.roles.find(role => role.name.toLowerCase() === emoji.name.toLowerCase());

        // Tag the player with the selected role, if it exists.
        if (role) {
            // Make an array of role objects for each of the roles
            let roles = ['healer', 'tank', 'dps', 'caster'];
            // Remove the selected role from the remove list
            roles.splice(roles.indexOf(role.name.toLowerCase()), 1);
            // Remove all other roles
            roles.forEach((roleName) => {
                let memberRole = channel.guild.roles.find(role => role.name.toLowerCase() === roleName.toLowerCase());
                if (memberRole) {
                    member.removeRole(memberRole);
                }
            });

            member.addRole(role).then(() => {
                client.setup.checkCompleteness(client, member);
            });
        }

        client.set.characterRole(client, channel.guild, member, member.displayName, emoji.name);
        if (!role) {
            client.setup.checkCompleteness(client, member);
        }

        client.log.write(client, member, channel, 'Role Set: ' + emoji.name.toLowerCase());

    },
    nick: (client, message) => {
        message.delete().catch(O_o=>{}); 
        let newName = message.content.trim();
        var reg = /^[a-zàâäåªæÆçÇœŒéèêëËƒíìîïÏñÑóòôöºúùûÜýÿ]+$/i;
        if (!reg.test(newName)) {
            return message.author.send('Unable to set your name.  Please use only letters.');
        }

        client.log.write(client, message.member, message.channel, 'Set Nick: ' + newName);

        // UCFirst
        newName = newName.charAt(0).toUpperCase() + newName.slice(1).toLowerCase();
        message.guild.members.get(message.author.id).setNickname(newName);  
        client.setup.checkCompleteness(client, message.member);
    },
    checkCompleteness: async function(client, member) {
        let factionChannel = member.guild.channels.find(c => c.name == "select-your-faction");
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
    applyCompleteRole: (client, member) => {
        let roleName = client.customOptions.get(member.guild, 'completerole');
        if (!roleName) {
            return false;
        }
        let role = member.guild.roles.find(role => role.name.toLowerCase() === roleName.toLowerCase());
        if (role) {
            member.addRole(role)
        }

    }
}
