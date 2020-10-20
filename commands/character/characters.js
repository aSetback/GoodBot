const Discord = require("discord.js");

exports.run = async function(client, message, args) {
    message.author.send('http://goodbot.me/characters/' + message.guild.id);
};