module.exports = {
    getUnsigned: async function(client, newRaid, oldRaid) {
        
        // Set up vars
        let unsigned = [];

        // Filter if necessary
        let signups = oldRaid.signups;

        // Loop through and check if each player is signed up
        signups.forEach((signup) => {
            if (!newRaid.signups.find(s => s.character.id == signup.character.id)) {
                unsigned.push(signup.character.name);
            }
        });
        return unsigned;
    },
    makeList: async function(client, guild, list) {
        let mentionText = '';
        let noMatch = [];

        for (key in list) {
            let character = list[key];
            let search = character.toLowerCase();
            let characterData = await client.models.character.findOne({where: {name: search, guildID: guild.id}});
            let memberID, member;

            if (characterData && characterData.pingID) {
                memberID = characterData.pingID;
            } else {
                // Retrieve the name of their main, or the current character name if no main is found
                let main = await client.notify.getMain(client, guild, search);

                // Attempt to retrieve the member
                main = main.toLowerCase();
                member = await client.notify.findUser(client, guild, main);

                // Maybe they're not cached .. let's try fetching them.
                if (!member) {
                    await guild.members.fetch({ query: main, limit: 10});
                    member = await client.notify.findUser(client, guild, main);
                }
                
                // Update the character model with the discord member ID for this user.
                if (member) {
                    memberID = member.id
                    client.models.character.update({ pingID: member.id }, {
                        where: {
                            id: characterData.id
                        }
                    });
                }
            }

            if (memberID) {
                mentionText += '<@' + memberID + '> ';
            } else {
                noMatch.push(character);
            }
        }

        if (noMatch.length) 
            mentionText += '\n' + 'Could not find: ' + noMatch.join(', ');

        return mentionText;
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

