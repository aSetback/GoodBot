module.exports = async (client, guild) => {
    let owner = client.users.find(u => u.id == guild.ownerID);
    owner.send('Thank you for choosing GoodBot!  \nTo set up your server, please visit this link: http://goodbot.me/dashboard/setup/' + guild.id + '\nFor support, please join our discord: http://discord.goodbot.me');

    client.guilds.forEach((guild) => {
        client.models.guild.findOne({where: {guildID: guild.id}}).then((savedGuild) => {
            if (!savedGuild) {
                client.models.guild.create({
                   name: guild.name,
                   guildID: guild.id
                });
            } else {
                client.models.guild.update({
                    name: guild.name
                }, {
                    where: {
                        guildID: savedGuild.id
                    }
                });
            }
        })
    });
};