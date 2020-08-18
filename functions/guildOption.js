module.exports = {
    set(client, guildID, key, value) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                key: key,
                value: value,
                guildID: guildID
            };
            client.models.guildOption.findOne({where: {key: key, guildID: guildID}}).then((option) => {
                if (option) {
                    client.models.guildOption.update(record, {where: {key: key, guildID: guildID}}).then(async () => {
                        await client.guildOption.cache(client, guildID);     
                        resolve('Option updated.');
                    });
                } else {
                    client.models.guildOption.create(record).then(async () => {
                        await client.guildOption.cache(client, guildID);     
                        resolve('Option saved.');
                    })
                }
            });
        });
        return promise;
    },
    get(client, guildID, key) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                key: key,
                guildID: guildID
            };
            client.models.guildOption.findOne({where: record}).then((option) => {
                if (option) {
                    resolve(option.value);
                } else {
                    resolve(false);
                }
            });
        });
        return promise;
    },
    async expansion(client, guildID) {
        let expansions = [
            'classic',
            'tbc',
            'wotlk',
            'cata',
            'mop',
            'wod',
            'legion',
            'boa',
            'sl'   
        ];
        let expacKey = await client.customOptions.get(client, guildID, 'expansion');
        if (!expacKey) {
            expacKey = await client.guildOption.get(client, guildID, 'expansion');
        }
        return expansions.indexOf(expacKey);
    },
    cache(client, guildID) {
        let promise = new Promise((resolve, reject) => {
            client.models.guildOption.findAll({where: {guildID: guildID}}).then((options) => {
                let cacheOptions = {};
                options.forEach((option) => {
                    cacheOptions[option.key] = option.value;
                });
                client.guildOptions[guildID] = cacheOptions;
                resolve(true);
            });
        });
        return promise;
    },
    async getCached(client, guildID, key) {
        if (!client.guildOptions[guildID]) {
            await client.guildOption.cache(client, guildID);     
        }
        return client.guildOptions[guildID][key] ? client.guildOptions[guildID][key] : null;
    }
}