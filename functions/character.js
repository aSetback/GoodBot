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
    }
}