const Discord = require("discord.js");
const moment = require('moment');

exports.run = async function(client, message, args) {
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return false;
	}

    // Retrieve the raid info
	let raid = await client.raid.get(client, message.channel);

    // Reassemble the search string
    let search = args.join(' ');

    // Retrieve all raid logs for this raid
    let raidLogs = await client.models.raidLog.findAll({where: {raidID: raid.id}});

    // Filter out our logs using a search filter
    if (search) {
        raidLogs = raidLogs.filter(rl => rl.event.indexOf(search) != -1);
    }

    let returnMessage = '-\n<#' + raid.channelID + '>\n```\n';
    returnMessage += 'Event'.padEnd(51) + 'Action By'.padEnd(31) + 'Date/Time\n';
    returnMessage += ''.padEnd(110, '-') + '\n';
    for (key in raidLogs) {
        let log = raidLogs[key];

        // Look up user
        let guild = client.guilds.cache.find(g => g.id == log.guildID);
        let member = guild.members.cache.find(m => m.id == log.memberID);
        let nickname = member.nickname ? member.nickname : member.user.username;

        returnMessage += log.event.padEnd(50) + ' ' + nickname.padEnd(30) + ' ' + moment(log.createdAt).utcOffset(-240).format('h:mm A, L') + '\n';
        if (returnMessage.length > 1800) {
            returnMessage += '```';
            message.author.send(returnMessage);
            returnMessage = '```\n'; 
        }
    }
    return message.author.send(returnMessage + '```');

};