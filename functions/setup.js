const fs = require("fs");

module.exports = {
    run: (client) => {
        client.on('raw', packet => {
            // Only parse emoji adds
            if (!['MESSAGE_REACTION_ADD'].includes(packet.t)) return;

            // Ignore the bot emojis
    		if (!packet.d.user_id == client.config.userId) return;

            console.log(packet.d.user_id + ' = ' + client.config.userId);

            let channel = client.channels.get(packet.d.channel_id);
            let emoji = packet.d.emoji;
            let member = channel.guild.members.get(packet.d.user_id);	

            // Don't operate on DMs
            if (!channel.guild) return;

            // Only parse emojis from these channels
            if (channel.name == 'select-your-class') {
                client.setup.selectClass(client, emoji, member, channel);    
            }
            if (channel.name == 'select-your-role') {
                client.setup.selectRole(client, emoji, member, channel);    
            }
        });
    },
    selectClass: (client, emoji, member, channel) => {
        // Check if a discord role exists for this emoji
        let role = channel.guild.roles.find(role => role.name.toLowerCase() === emoji.name.toLowerCase());

        client.log.write(client, member, channel, 'Added Role: ' + emoji.name);

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

            member.addRole(role);
        }

        client.set.playerClass(channel.guild, member.displayName, emoji.name);

    },
    selectRole: (client, emoji, member, channel) => {
        // Check if a discord role exists for this emoji
        let role = channel.guild.roles.find(role => role.name.toLowerCase() === emoji.name.toLowerCase());

        client.log.write(client, member, channel, 'Added Role: ' + emoji.name);

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

            member.addRole(role);
        }

        client.set.playerRole(channel.guild, member.displayName, emoji.name);

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
    }
}
