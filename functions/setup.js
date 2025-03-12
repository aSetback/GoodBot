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
        await member.guild.members.fetch({user: [member.id], force: true});

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

        if (role) {
            if (action == 'add') {
                await member.roles.add(role.id).catch((e) => { console.error('Add role failed, no permission')});
                client.setup.checkCompleteness(client, member);
                client.log.write(client, member, channel, 'Faction Added: ' + faction);
            } else {
                await member.roles.remove(role.id).catch((e) => {});
                client.log.write(client, member, channel, 'Faction Removed: ' + faction);
            }
        }
    },
    nick: async (client, message) => {
        setTimeout(() => {
            message.delete().catch(O_o=>{}); 
        }, 1000);
        await message.guild.members.fetch({user: [message.author.id], force: true});

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
        client.setup.checkCompleteness(client, message.member);
    },
    checkCompleteness: async function(client, member) {
        await member.guild.members.fetch({user: [member.id], force: true});
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
        await member.guild.members.fetch({user: [member.id], force: true});

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
