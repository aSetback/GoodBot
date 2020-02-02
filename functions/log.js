module.exports = {
        write: (client, member, channel, data) => {

        // Base message of timestamp, and the data to be logged
        let logMessage = data;
        try {
            // Check if this is being sent via DM
            if (channel.type != 'dm') {
                if (member) {
                    if (!member.user) {
                        member.user = member;
                    }
                    nickname = member.nickname ? member.nickname : member.user.username;

                    if (client.config.userId == member.user.id) {
                        logMessage += ' / Sign up via emoji';
                    } else {
                        logMessage += ' / Member: ' + nickname + ' (' + member.user.id + ')';
                    }
                }
                logMessage += ' / Channel: ' + channel.name;

                // Attempt to log to a server-logs channel
                let logChannel = channel.guild ? channel.guild.channels.find(c => c.name == "server-logs") : null;
                if (logChannel) {
                    logChannel.send(logMessage);
                }

                // No point of writing what guild it is to the server logs channel.
                logMessage += ' / Guild: ' +  channel.guild.name  + ' (' + channel.guild.id + ')';
            } else {
                // This is a direct message, only write it to console
                logMessage += ' / DM From: ' + member.username + ' (' + member.id + ')';
            }

            // Write to console
            console.log('[' + client.timestamp.get() + '] ' + logMessage);
        } catch (e) {
            console.error(e);
        }
    }
}