const { Op } = require('sequelize');

module.exports = {
    async factionRequired(client, guild) {
        let factionRequired = await client.customOptions.get(client, guild, "factionrequired");
        return parseInt(factionRequired);
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
    setRules(client, raid, rules) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                rules: rules
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
    setLeader(client, raid, memberID) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                memberID: memberID
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
    setName(client, raid, name) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                name: name
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
    setDate(client, raid, raidDate) {
        let promise = new Promise((resolve, reject) => {
            let record = {
                date: raidDate
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
                { model: client.models.raid, as: 'raid', foreignKey: 'raidID' },
                {
                    model: client.models.raidReserve, as: 'reserve', foreignKey: 'signupID', include: {
                        model: client.models.reserveItem, as: 'item', foreignKey: 'raidReserveID'
                    }
                },
            ];
            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            let twoWeeks = new Date();
            twoWeeks.setDate(twoWeeks.getDate() + 14);
            client.models.signup.findAll({ where: { '$raid.date$': { [Op.between]: [yesterday, twoWeeks] }, guildID: guildID, player: { [Op.in]: names } }, include: includes }).then((signups) => {
                resolve(signups);
            });
        });
        return promise;
    },
    get(client, channel) {
        let promise = new Promise((resolve, reject) => {
            client.models.raid.findOne({ 
                where: {
                    [Op.or]: [
                        {channelID: channel.id},
                        {crosspostID: channel.id}
                    ]
                }
            }).then((raid) => {
                if (!raid) {
                    client.models.raid.findOne({ where: { 'crosspostID': channel.id } }).then((raid) => {
                        resolve(raid);
                    });
                } else {
                    resolve(raid);
                }
            });
        });
        return promise;
    },
    getReserveHistory: async (client, guildID, raid) => {
        let promise = new Promise((resolve, reject) => {
            let includes = [
                {
                    model: client.models.raidReserve, as: 'reserve', foreignKey: 'signupID', include: {
                        model: client.models.reserveItem, as: 'item', foreignKey: 'raidReserveID'
                    }
                }
            ];
            let timesReserved = {};
            let signupNames = [];
            client.models.signup.findAll({ where: { raidID: raid.id } }).then((signups) => {
                for (key in signups) {
                    signupNames.push(signups[key].player);
                }
                client.models.signup.findAll({ where: { guildID: guildID, player: { [Op.in]: signupNames } }, include: includes }).then((signups) => {
                    signups.forEach((signup) => {
                        if (signup.reserve && signup.reserve.item) {
                            if (timesReserved[signup.player]) {
                                if (timesReserved[signup.player][signup.reserve.item.id]) {
                                    timesReserved[signup.player][signup.reserve.item.id].count++;
                                } else {
                                    timesReserved[signup.player][signup.reserve.item.id] = { count: 1, name: signup.reserve.item.name };
                                }
                            } else {
                                timesReserved[signup.player] = [];
                                timesReserved[signup.player][signup.reserve.item.id] = { count: 1, name: signup.reserve.item.name };
                            }
                        }
                    });
                    resolve(timesReserved);
                });
            });
        });
        return promise;
    },
    createRaidChannel: async (client, message, category, raid, guild) => {
        let promise = new Promise((resolve, reject) => {
            if (!category) {
                message.channel.send('Raid sign-up category __' + category + '__ does not exist.');
                return false;
            }
            if (!raid.dateString || !raid.raid) {
                return message.channel.send('Invalid parameters.  Please use the following format: +raid MC Oct-15 <name?>');
            }

            let channelName = raid.dateString + '-' + raid.name;
            if (!guild) {
                guild = message.guild;
            }
            guild.createChannel(channelName, {
                type: 'text'
            })
                .then(async (channel) => {
                    let raidDateParts = raid.dateString.split('-');
                    // Parse out our date
                    raid.parsedDate = new Date(Date.parse(raidDateParts[0] + " " + raidDateParts[1]));
                    raid.parsedDate.setFullYear(new Date().getFullYear());

                    // If 'date' appears to be in the past, assume it's for the next calendar year (used for the dec => jan swapover)
                    if (raid.parsedDate.getTime() < new Date().getTime()) {
                        raid.parsedDate.setFullYear(raid.parsedDate.getFullYear() + 1);
                    }

                    // Set up our sql record
                    let record = {
                        'name': raid.name ? raid.name : raid.raid,
                        'raid': raid.raid,
                        'date': raid.parsedDate,
                        'title': raid.title ? raid.title : null,
                        'faction': raid.faction ? raid.faction.toLowerCase() : null,
                        'color': raid.color ? raid.color : '#02a64f',
                        'description': raid.description ? raid.description : null,
                        'rules': raid.rules ? raid.rules : null,
                        'time': raid.time ? raid.time : null,
                        'channelID': channel.id,
                        'guildID': channel.guild.id,
                        'memberID': message.author.id,
                        'softreserve': raid.softreserve,
                        'confirmation': raid.confirmation
                    };
                    if (raid.id) {
                        await client.models.raid.update({crosspostID: channel.id}, {where: {id: raid.id}});
                    } else {
                        await client.models.raid.create(record);
                    }

                    let signupMessage = '*If you do not see a sign-up below this message, please enable embeds on discord.*';
                    channel.setParent(category.id)
                    .then((channel) => {
                        channel.lockPermissions()
                            .then(() => console.log('Successfully synchronized permissions with parent channel'))
                            .catch(console.error);
                    });

                    channel.send(signupMessage).then((botMsg) => {
                        client.raid.reactEmoji(botMsg);
                        botMsg.pin().then(() => {
                            client.embed.update(client, channel);
                            resolve(channel);
                        });
                    });

                });
        });
        return promise;
    },
    reactEmoji: async (msg) => {
        const emojis = ["👍", "🤷", "👎"];
        for (i = 0; i < emojis.length; i++) {
            await msg.react(emojis[i]);
        }
    }

}