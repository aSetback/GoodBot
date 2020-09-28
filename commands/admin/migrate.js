exports.run = async (client, message, args) => {
    if (!message.isAdmin) {
        return false;
    }
    
    let cache = [];
    client.models.signup.findAll({where: {characterID: null}, limit: 25000}).then((signups) => {
        signups.forEach(async (signup) => {
            if (!cache[signup.guildID]) {
                cache[signup.guildID] = [];
            }

            if (!cache[signup.guildID][signup.player]) {
                character = await client.models.character.findOne({where: {name: signup.player, guildID: signup.guildID}, order: [['updatedAt', 'DESC']]});
                cache[signup.guildID][signup.player] = character ? character.id : 0;
            }
            let characterID = cache[signup.guildID][signup.player];

            client.models.signup.update({characterID: characterID}, {where: {id: signup.id}});
            console.log('Updated Signup ' + signup.id + ' (' + signup.player + '/' + signup.guildID + ')');

        });
    });


}