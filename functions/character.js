module.exports = {
    get(client, characterName, guildID) {
        let promise = new Promise((resolve, reject) => {
            client.models.character.findOne({ where: {name: characterName, guildID: guildID}}).then((character) => {
                    resolve(character);
            });
        });
        return promise;
    },
    getAttendance(client, character, guildID) {
        let promise = new Promise((resolve, reject) => {
            client.models.signup.findAll({ where: {player: character.name, guildID: guildID}}).then((signups) => {
                character.signups = 0;
                character.noshows = 0;
                signups.forEach((signup) => {
                    if (signup.signup == 'yes') {
                        character.signups ++;
                    }
                    if (signup.noshow) {
                        character.noshows++;
                    }
                });
                resolve(character);
            });
        });
        return promise;
    },
    getByID(client, id) {
        let promise = new Promise((resolve, reject) => {
            client.models.character.findOne({ where: {id: id}}).then((character) => {
                resolve(character);
            });
        });
        return promise;
    },
    getAlts(client, character) {
        let promise = new Promise((resolve, reject) => {
            client.models.character.findAll({ where: { mainID: character.id}}).then((characters) => {
                resolve(characters);
            });
        });
        return promise;
    },
    // The character a guild member is playing as: one named after their nickname/username if it
    // exists (may be an alt), otherwise their most recently created main by Discord ID.  Name
    // matching comes first because memberID on older records may not be the character's owner.
    async getForMember(client, member) {
        let names = [...new Set([member.displayName, member.user.username].map(name => client.general.ucfirst(name)))];
        for (let name of names) {
            let character = await client.models.character.findOne({ where: {name: name, guildID: member.guild.id}});
            if (character) {
                return character;
            }
        }
        return client.models.character.findOne({ where: {memberID: member.id, guildID: member.guild.id, mainID: null}, order: [['id', 'DESC']]});
    },
    // Same as getForMember, but resolves an alt to its main.
    async getMainForMember(client, member) {
        let character = await client.character.getForMember(client, member);
        if (character && character.mainID) {
            let main = await client.character.getByID(client, character.mainID);
            if (main) {
                return main;
            }
        }
        return character;
    },
    // Record member as the owner of a character, creating it if needed.  Returns the character.
    async claim(client, member, characterName, values = {}) {
        let name = client.general.ucfirst(characterName);
        let record = Object.assign({memberID: member.id}, values);
        let character = await client.models.character.findOne({ where: {name: name, guildID: member.guild.id}});
        if (!character) {
            return client.models.character.create(Object.assign({name: name, guildID: member.guild.id}, record));
        }
        await client.models.character.update(record, {where: {id: character.id}});
        return character.set(record);
    }
}