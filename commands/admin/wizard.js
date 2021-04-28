const https = require("https");
const Discord = require("discord.js");

exports.run = async (client, message, args) => {
    if (args[0].toLowerCase() == 'enable') {
        await client.models.settings.update({wizard: 1}, {where: {guildID: message.guild.id}});
        return client.messages.send(message.channel, 'New player wizard enabled.', 240);
    }
    if (args[0].toLowerCase() == 'disable') {
        await client.models.settings.update({wizard: 0}, {where: {guildID: message.guild.id}});
        return client.messages.send(message.channel, 'New player wizard disabled.', 240);
    }
}