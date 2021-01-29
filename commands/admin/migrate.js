exports.run = async (client, message, args) => {
    if (!message.isAdmin) {
        return false;
    }
    
    let cache = [];
    let includes = [
        {model: client.models.raid, as: 'raid', foreignKey: 'raid'},
    ];

    client.models.signup.findAll({where: {characterID: null}, include: includes, limit: 25000}).then((signups) => {
        signups.forEach(async (signup) => {
            if (!cache[signup.guildID]) {
                cache[signup.guildID] = [];
            }

            if (!cache[signup.guildID][signup.player]) {
                character = await client.models.character.findOne({where: {name: signup.player, guildID: signup.guildID}, order: [['updatedAt', 'DESC']]});
                if (!character) {
                    character = await client.models.character.findOne({where: {name: signup.player, guildID: signup.raid.crosspostGuildID}, order: [['updatedAt', 'DESC']]});
                }
                cache[signup.guildID][signup.player] = character ? character.id : 0;
            }
            let characterID = cache[signup.guildID][signup.player];

            client.models.signup.update({characterID: characterID}, {where: {id: signup.id}});
        });
    });


}