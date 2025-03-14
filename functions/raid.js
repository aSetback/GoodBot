const { Op } = require('sequelize');
const { ChannelType } = require("discord.js");

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
    addLeader(client, raid, memberID) {
        let promise = new Promise((resolve, reject) => {
            client.models.raidLeader.findOne({where: {'memberID': memberID, 'raidID': raid.id}}).then(async (raidLeader) => {
                if (!raidLeader) {
                    await client.models.raidLeader.create({
                        'raidID': raid.id,
                        'memberID': memberID,
                        'guildID': raid.guildID
                    });
                }
                resolve();
            });
        });
        return promise;
    },
    removeLeader(client, raid, memberID) {
        let promise = new Promise((resolve, reject) => {
            client.models.raidLeader.findOne({where: {'memberID': memberID, 'raidID': raid.id}}).then(async (raidLeader) => {
                if (raidLeader) {
                    await client.models.raidLeader.destroy({where: {'id': raidLeader.id}});
                }
                resolve();
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
        let includes = [
            {model: client.models.raidLeader, as: 'leaders', foreignKey: 'raidID'},
            {model: client.models.signup, as: 'signups', foreignKey: 'signupID', include: {
                model: client.models.character, as: 'character', foreignKey: 'characterID'
            }},
        ];

        let channelID = null;
        if (typeof channel == 'string') {
            channelID = channel;
        } else {
            channelID = channel.id;
        }

        let promise = new Promise((resolve, reject) => {
            client.models.raid.findOne({ 
                where: {
                    [Op.or]: [
                        {channelID: channelID},
                        {crosspostID: channelID}
                    ]
                },
                include: includes
            }).then((raid) => {
                if (!raid) {
                    client.models.raid.findOne({ where: { 'crosspostID': channelID } }).then((raid) => {
                        resolve(raid);
                    });
                } else {
                    resolve(raid);
                }
            });
        });
        return promise;
    },
    getReserveHistory: async (client, guildID, raid, raidName) => {
        let promise = new Promise((resolve, reject) => {
            let includes = [
                {
                    model: client.models.raid, as: 'raid', foreignKey: 'raidID'
                },
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

                whereClause = { guildID: guildID, player: { [Op.in]: signupNames }};
                if (raidName) {
                    whereClause['$raid.name$'] = raidName;
                }
    
                client.models.signup.findAll({ where: whereClause, include: includes }).then((signups) => {
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
    getCategory: async (client, guildID, raidType, faction) => {
        // Retrieve guild's default category
        let category = await client.customOptions.get(client, guildID, 'raidcategory');

        // Raid category hasn't been set -- 
        if (!category) {
            category = 'Raid Signups';
        }

        let guild = await client.guilds.cache.find(g => g.id == guildID);

        // Check for overwrite for this raid type
        let categoryParams = {'raid': raidType, 'guildID': guildID};
        if (faction) {
            categoryParams.faction = faction;
        }
        let raidCategory = await client.models.raidCategory.findOne({ where: categoryParams});
        if (raidCategory)  {
            category = raidCategory.category;
        }

        return category;

    },
    archive: async (client, channel) => {
        // Retrive the guild, then the channel & category within the guild.
        let guild = channel.guild;
        let category = guild.channels.cache.find(c => c.name == "Archives" && c.type == 4);
    
        // Retrieve our raid information
    	let raid = await client.raid.get(client, channel);
        let errorMessage;

        // Verify the 'Archives' Category exists
        if (category) {
            try {
                // Set the channel's parent to 'Archives'
                channel = await channel.setParent(category.id);
                // Sync the permissions to the category
                channel.lockPermissions();
                // Update the 'archived' bit in the raid table
                if (raid) {
                    client.models.raid.update({'archived': 1}, {where: {id: raid.id}});
                }
            } catch (e) {
                // Generally the only reason this fails is that the archvies is full (50 channels).  Inform the user.
                let errorArchiveMaxChannel = client.loc('errorMaxChannel', "The category **Archives** is full, this channel could not be moved.");
                errorMessage = errorArchiveMaxChannel;
            }
        } else {
            // The archives channel does not exist.  Inform the user.
            let errorArchiveNoChannel = client.loc('errorMaxChannel', "The category **Archives** does not exist, please create the category to use this command.");
            errorMessage = errorArchiveNoChannel;
        }
        return {success: (errorMessage ? 0 : 1), message: errorMessage};
    },
    createEventChannel: async (client, message, category, raid, guild) => {
        let promise = new Promise(async (resolve, reject) => {
            if (!category) {
                message.channel.send('Category __' + category + '__ does not exist.');
                return false;
            }
            if (!raid.dateString || !raid.raid) {
                return message.channel.send('Invalid parameters.  Please use the following format: +event MC Oct-15 <name?>');
            }

            let channelName = raid.dateString + '-' + raid.name;
            if (!guild) {
                guild = message.guild;
            }
            let channel = await guild.channels.create(channelName, {
                type: 0
            })

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
                'confirmation': raid.confirmation,
                'reserveLimit': raid.reserveLimit
            };
            if (raid.id) {
                await client.models.raid.update({crosspostID: channel.id}, {where: {id: raid.id}});
            } else {
                await client.models.raid.create(record);
            }

            let signupMessage = '*If you do not see a sign-up below this message, please enable embeds on discord.*';
            let botMsg = await channel.send(signupMessage, client.buttonRow)
            await botMsg.pin();
            client.embed.eventUpdate(client, channel);
            channel = await channel.setParent(category.id);
            channel.lockPermissions().catch(console.error);    
            resolve(channel);

        });
        return promise;
    },
    createRaidThread: async (client, message, raid, guild) => {
        let promise = new Promise(async (resolve, reject) => {
            if (!raid.dateString || !raid.raid) {
                return message.channel.send('Invalid parameters.  Please use the following format: +raid MC Oct-15 <name?>');
            }

            let channelName = raid.dateString + '-' + raid.name;
            if (!guild) {
                guild = message.guild;
            }
            let forum = await guild.channels.create({
                name: "Test",
                type: ChannelType.GuildForum
            })
            let channel = await forum.threads.create({
                name: channelName,
                message: "-"
            });

            let raidDateParts = raid.dateString.split('-');
            // Parse out our date
            raid.parsedDate = new Date(Date.parse(raidDateParts[0] + " " + raidDateParts[1]));
            raid.parsedDate.setFullYear(new Date().getFullYear());

            // If 'date' appears to be in the past, assume it's for the next calendar year (used for the dec => jan swapover)
            if (raid.parsedDate.getTime() < new Date().getTime()) {
                raid.parsedDate.setFullYear(raid.parsedDate.getFullYear() + 1);
            }

            let memberID = null;
            if (message.author) {
                memberID = message.author.id;
            } else {
                memberID = message.user.id;
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
                'memberID': memberID,
                'softreserve': raid.softreserve,
                'confirmation': raid.confirmation,
                'reserveLimit': raid.reserveLimit
            };
            if (raid.id) {
                await client.models.raid.update({crosspostID: channel.id}, {where: {id: raid.id}});
            } else {
                await client.models.raid.create(record);
            }

            let signupMessage = '*If you do not see a sign-up below this message, please enable embeds on discord.*';
            let botMsg = await channel.send(signupMessage, client.buttonRow);
            await botMsg.pin();
            client.embed.update(client, channel);
            channel = await channel.setParent(category.id);
            channel.lockPermissions().catch(console.error);    
            resolve(channel);

        });
        return promise;
    },
    createRaidChannel: async (client, message, category, raid, guild) => {
        let promise = new Promise(async (resolve, reject) => {
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
            let channel = await guild.channels.create({
                name: channelName,
                type: 0
            })

            let raidDateParts = raid.dateString.split('-');
            // Parse out our date
            raid.parsedDate = new Date(Date.parse(raidDateParts[0] + " " + raidDateParts[1]));
            raid.parsedDate.setFullYear(new Date().getFullYear());

            // If 'date' appears to be in the past, assume it's for the next calendar year (used for the dec => jan swapover)
            if (raid.parsedDate.getTime() < new Date().getTime()) {
                raid.parsedDate.setFullYear(raid.parsedDate.getFullYear() + 1);
            }

            let memberID = null;
            if (message.author) {
                memberID = message.author.id;
            } else {
                memberID = message.user.id;
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
                'memberID': memberID,
                'softreserve': raid.softreserve,
                'confirmation': raid.confirmation,
                'reserveLimit': raid.reserveLimit
            };
            if (raid.id) {
                await client.models.raid.update({crosspostID: channel.id}, {where: {id: raid.id}});
            } else {
                await client.models.raid.create(record);
            }

            let signupMessage = '*If you do not see a sign-up below this message, please enable embeds on discord.*';
            let botMsg = await channel.send(signupMessage, client.buttonRow);
            await botMsg.pin();
            client.embed.update(client, channel);
            channel = await channel.setParent(category.id);
            channel.lockPermissions().catch(console.error);    
            resolve(channel);

        });
        return promise;
    }
}
