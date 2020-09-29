const raid = require("../../functions/raid");

exports.run = async (client, message, args) => {
    if (!message.isAdmin) {
        return false;
    }
    
    client.models.raid.findAll({where: {crosspostGuildID: null}, limit: 25000}).then((raids) => {
        raids.forEach((raid) => {
            if (raid.crosspostID) {
                let channel = client.channels.find(c => c.id == raid.crosspostID);
                if (channel) {
                    console.log('updating ' + channel.id);
                    client.models.raid.update({crosspostGuildID: channel.guild.id}, {where: {id: raid.id}});
                }
            }
        });
    });
}