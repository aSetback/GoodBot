module.exports = {
    get(client, characterName, guildID) {
        let promise = new Promise((resolve, reject) => {
            client.models.character.findOne({ where: {name: characterName, guildID: guildID}}).then((character) => {
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