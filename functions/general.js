const fs = require("fs");

module.exports = {
    ucfirst: (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    getChannel: async (channelName, guild) => {
        if (channelName.substring(0, 2) == '<#') {
            let channelID = channelName.substring(2, channelName.length - 1);
            channel = await guild.channels.find(c => c.id == channelID);
        } else {
            channel = await guild.channels.find(c => c.name == channelName);
        }
        return channel;
    }
}
