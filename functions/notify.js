module.exports = {
    makeList: async function(client, guild, list) {
        let promise = new Promise( async (resolve, reject) => {
            let mentionText = '';
            let noMatch = [];

            for (key in list) {
                let character = list[key];
                let search = character.toLowerCase();
                let main = await client.notify.getMain(client, guild, search);
                main = main.toLowerCase();
                
                let member = await client.notify.findUser(client, guild, main);
 
                // Maybe they're not cached .. let's try fetching them.
                if (!member) {
                    await guild.members.fetch({ query: main, limit: 10});
                    member = await client.notify.findUser(client, guild, main);
                }

                // Maybe they used the '+account' command to set up an account!
                if (!member) {
                    member = await client.models.character.findOne({where: {name: main, guildID: guild.id}});
                }

                if (member) {
                    let memberID = member.pingMemberID ? member.pingMemberID : member.user.id;
                    mentionText += '<@' + memberID + '> ';
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

            resolve(member);
        });
        return promise;
    },
    getMain: (client, guild, search) => {
        let promise = new Promise((resolve, reject) => {
            client.models.character.findOne({where: {name: search, guildID: guild.id}}).then((character) => {
                if (character && character.mainID) {
                    client.models.character.findOne({where: {id: character.mainID}}).then((main) => {
                        resolve(main.name);
                    });
                } else {
                    resolve(search);
                }
            });
        });
        return promise;
    }
}

