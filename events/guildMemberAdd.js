const { Message } = require("discord.js");

module.exports = (client, member) => {
    let guildID = member.guild.id;
    client.models.settings.findOne({where: {guildID: guildID}}).then((settings) => {
        if (settings && settings.welcomeMessage) {
            member.send(settings.welcomeMessage);
        }
        if (settings && settings.wizard) {
            client.wizard.run(client, member);
        }
    });
};