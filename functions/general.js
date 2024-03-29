const fs = require("fs");

module.exports = {
    ucfirst: (text) => {
        return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';
    },
    getChannel: async (channelName, guild) => {
        if (channelName.substring(0, 2) == '<#') {
            let channelID = channelName.substring(2, channelName.length - 1);
            channel = await guild.channels.cache.find(c => c.id == channelID);
        } else {
            channel = await guild.channels.cache.find(c => c.name == channelName);
        }
        return channel;
    },
    parseTime: (time) => {
        let regex = new RegExp(/([1]?[0-9]):([0-9][0-9])[\s]*?([apsAPS][mMtT])/);
        let parsed = regex.exec(time);
        let hours = '00';
        let minutes = '00';
        if (!parsed) {
            return false;
        }
        if (parsed[1]) {
            hours = parseInt(parsed[1]);
        }
        if (parsed[2]) {
            minutes = parsed[2];
        }
        if (parsed[3]) {
            if (parsed[3].toLowerCase() == 'pm') {
                hours += 12;
            }
        }
        return hours.toString().padStart(1, '0') + ':' + minutes.padStart(1, '0') + ':00';
    },
    parseList: (args) => {
        // Re-join our args
        let list = args.join(' ').toLowerCase().replace(/,/g, ' ');

        // Split by spaces, commas, or quoted groups.
        let regex = /[^\s"]+|"([^"]*)"/gi;
        let returnArray = [];
        do {
            var match = regex.exec(list);
            if (match != null)
            {
                returnArray.push(match[1] ? match[1] : match[0]);
            }
        } while (match != null);

        // Return the array of items listed.
        return returnArray;
    }
};
