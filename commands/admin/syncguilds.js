exports.run = (client, message, args) => {
    if (!message.isAdmin) {
        return false;
    }
    
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


}