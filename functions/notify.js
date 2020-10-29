module.exports = {
    makeList: async function(client, guild, list) {
        let promise = new Promise( async (resolve, reject) => {
            let mentionText = '';
            let noMatch = [];

            for (key in list) {
                let character = list[key];
                let search = character.toLowerCase();

                let member = await client.notify.findUser(client, guild, search);
                if (!member) {
                    memberQuery = await guild.members.fetch({ query: search, limit: 1});
                    member = await client.notify.findUser(client, guild, search);
                }

                if (member) {
                    mentionText += '<@' + member.user.id + '> ';
                } else {
                    noMatch.push(character);
                }
            }
            if (noMatch.length) 
                mentionText += '\n' + 'Could not find: ' + noMatch.join(', ');

            resolve(mentionText);
        });
        return promise;
    },
    findUser: async (client, guild, search) => {
        let promise = new Promise(async (resolve, reject) => {
            // Try to find by nickname first
            var member = await guild.members.cache.find((member) => (member.nickname && member.nickname.toLowerCase() == search));

            // if you can't find by nickname, check username
            if (!member) {
                member = await guild.members.cache.find(member => member.user.username.toLowerCase() == search);
            }

            if (!member) {
                member = await client.notify.getMain(client, guild, search);
            }
            resolve(member);
        });
        return promise;
    },
    getMain: (client, guild, character) => {
        let promise = new Promise((resolve, reject) => {
            client.models.character.findOne({where: {name: character, guildID: guild.id}}).then((character) => {
                if (character && character.mainID) {
                    client.models.character.findOne({where: {id: character.mainID}}).then((main) => {
                        let search = main.name.toLowerCase();
                        var member = guild.members.cache.find((member) => (member.nickname && member.nickname.toLowerCase() == search));
                        if (!member) {
                            member = guild.members.cache.find(member => member.user.username.toLowerCase() == search);
                        }
                        if (member) {
                            resolve(member);
                        } else {
                            resolve(false);
                        }
                    });
                } else {
                    resolve(false);
                }
            });
        });
        return promise;
    }
}

