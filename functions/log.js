module.exports = {
        raidLog: (client, message, event, eventType) => {
            let record = {
                'event': event,
                'eventType': eventType,
                'channelID': message.raid.channelID,
                'memberID': message.author.id,
                'guildID': message.raid.guildID,
                'raidID': message.raid.id
            }
            
            client.models.raidLog.create(record);
        },
        write: (client, member, channel, data) => {

        // Base message of timestamp, and the data to be logged
        let logMessage = data;
        let memberName = null;
        let memberID = null;
        try {
            // Check if this is being sent via DM
            if (channel.type != 'dm') {
                if (member) {
                    if (!member.user) {
                        member.user = member;
                    }
                    let nickname = member.nickname ? member.nickname : member.user.username;
                    memberName = nickname;
                    memberID = member.user.id;
                    if (client.config.userId == member.user.id) {
                        logMessage += ' / Sign up via emoji';
                    } else {
                        logMessage += ' / Member: ' + nickname + ' (' + member.user.id + ')';
                    }
                }
                if (channel.name) {
                    logMessage += ' / Channel: ' + channel.name;
                }

                // Attempt to log to a server-logs channel
                let logChannel = channel.guild ? channel.guild.channels.cache.find(c => c.name == "server-logs") : null;
                if (logChannel) {
                    logChannel.send(logMessage);
                }

                // No point of writing what guild it is to the server logs channel.
                logMessage += ' / Guild: ' +  channel.guild.name  + ' (' + channel.guild.id + ')';
            } else {
                // This is a direct message, only write it to console
                logMessage += ' / DM From: ' + member.user.username + ' (' + member.id + ')';
                memberName = member.username;
                memberID = member.id;
            }

            let guildID = null;
            let guildName = null;
            if (channel.guild) {
                guildID = channel.guild.id;
                guildName = channel.guild.name;
            }

            let record = {
                event: logMessage,
                guildName: guildName,
                guildID: guildID,
                memberName: memberName,
                memberID: memberID
            }

            client.models.log.create(record);

            // Write to console
            console.log('(GB) [' + client.timestamp.get() + '] ' + logMessage);
        } catch (e) {
            console.error(e);
        }
    }
}