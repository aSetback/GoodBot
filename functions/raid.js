module.exports = {
    setTitle(client, raid, title) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                title: title
            };
            client.models.raid.update(record, {
                where: {
                    id: raid.id,
                }
            }).then(() => {
                resolve(true);
            });
        });
        return promise;
    },
    setDescription(client, raid, description) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                description: description
            };
            client.models.raid.update(record, {
                where: {
                    id: raid.id,
                }
            }).then(() => {
                resolve(true);
            });
        });
        return promise;
    },
    setColor(client, raid, color) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                color: color
            };
            client.models.raid.update(record, {
                where: {
                    id: raid.id,
                }
            }).then(() => {
                resolve(true);
            });
        });
        return promise;
    },
    setTime(client, raid, time) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                time: time
            };
            client.models.raid.update(record, {
                where: {
                    id: raid.id,
                }
            }).then(() => {
                resolve(true);
            });
        });
        return promise;
    },
    get(client, channel) {
        let promise = new Promise((resolve, reject) => {
            client.models.raid.findOne({ where: {'channelID': channel.id}}).then((raid) => {
                resolve(raid);
            });
        });
        return promise;
    }
}