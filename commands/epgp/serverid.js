const https = require("https");
const Discord = require("discord.js");

exports.run = (client, message, args) => {
    message.delete();
    return message.author.send('Server ID: ' + message.guild.id);    
}