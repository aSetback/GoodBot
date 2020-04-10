module.exports = (client, member) => {
    let guildID = member.guild.id;
    client.models.settings.findOne({where: {guildID: guildID}}).then((settings) => {
        member.send(settings.joinMessage);
    });
};