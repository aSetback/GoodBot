const Discord = require("discord.js");
const { Permissions } = require('discord.js');

exports.run = (client, message, args) => {
    let newName = args[0];
    if (!newName) {
        return message.author.send('Please include a name with this command.');
    }
    var reg = new RegExp(client.config.validCharacters, 'i');
    if (!reg.test(newName)) {
        return message.author.send('Unable to set your name.  Please use only letters.');
    }

    // UCFirst
    newName = newName.charAt(0).toUpperCase() + newName.slice(1).toLowerCase();
    if (message.guild) {
        message.guild.members.cache.get(message.author.id).setNickname(newName);
        return message.author.send('Your nickname has been updated.');
    }
};