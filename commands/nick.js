const Discord = require("discord.js");
const { Permissions } = require('discord.js');

exports.run = (client, message, args) => {
    message.delete().catch(O_o=>{}); 
    let newName = args[0];
    var reg = /^[a-zàâäåªæÆçÇœŒéèêëËƒíìîïÏñÑóòôöºúùûÜýÿ]+$/i;
    if (!reg.test(newName)) {
        return message.author.send('Unable to set your name.  Please use only letters.');
    }

    // UCFirst
    newName = newName.charAt(0).toUpperCase() + newName.slice(1).toLowerCase();
    message.guild.members.get(message.author.id).setNickname(newName);  
};