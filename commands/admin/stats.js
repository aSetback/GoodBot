const https = require("https");
const Discord = require("discord.js");

exports.run = async (client, message, args) => {
    let raids = await client.models.raid.count({where: {guildID: message.guild.id}});
    let characters = await client.models.character.count({where: {guildID: message.guild.id}});
    let signups = await client.models.signup.count({where: {guildID: message.guild.id}});
    let nf = Intl.NumberFormat();
    message.channel.send('```md\nRaids:      ' + nf.format(raids) + '\nCharacters: ' + nf.format(characters) + '\nSignups:    ' + nf.format(signups) + '```');
}