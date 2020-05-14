const { Op } = require('sequelize');

module.exports = {
    factionRequired(client, guild) {
        return parseInt(client.customOptions.get(guild, "factionrequired"));
    },
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
    setFaction(client, raid, faction) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                faction: faction
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
    setRaid(client, raid, raidType) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                raid: raidType
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
    getSignup(client, raid, player) {
        let promise = new Promise((resolve, reject) => {
            client.models.signup.findOne({ where: { raidID: raid.id, player: player } }).then((signup) => {
                resolve(signup);
            });
        });
        return promise;
    },
    getSignupsByName(client, names, guildID) {
        let promise = new Promise((resolve, reject) => {
            let includes = [
                {model: client.models.raid, as: 'raid', foreignKey: 'raidID'},
                {model: client.models.raidReserve, as: 'reserve', foreignKey: 'signupID', include: {
                    model: client.models.reserveItem, as: 'item', foreignKey: 'raidReserveID'
                }},
            ];
            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            let twoWeeks = new Date();
            twoWeeks.setDate(twoWeeks.getDate() + 14);
            client.models.signup.findAll({ where: {'$raid.date$': {[Op.between]: [yesterday, twoWeeks]}, guildID: guildID, player: {[Op.in]: names}}, include: includes}).then((signups) => {
                resolve(signups);
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