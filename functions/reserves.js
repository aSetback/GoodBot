const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {    
    reserveItem: async (client, raid, character, item, memberID) => {
    
        // Check if the first arg is a playername
        let player = character.toLowerCase();
    
        // Make sure the user is signed up!
        let signup = await client.reserves.findSignup(client, raid.id, player);

        // The user isn't signed up -- maybe they are trying to put in a reserve for an alt?
        if (!signup) {
            let main = await client.character.get(client, player, raid.guildID);
            let alts = await client.character.getAlts(client, main);
            signup = await client.reserves.findAltSignup(client, raid.id, alts);
            player = signup.name;
        }

        // No alts were found either .. bummer!
        if (!signup) {
            return {result: -1, message: "We couldn't find " + player + " in the sign-ups for this raid."};
        } 

        // You can't reserve if soft reserve is not enabled
        if (!raid.softreserve) {
            return {result: -1, message: "Soft reserve is not currently enabled for this raid."};
        }
    
        // You can't reserve if the raid is locked!
        if (raid.locked) {
            return {result: -1, message: "This raid is locked -- new reserves can not currently be added."};
        }
    
        // Initial check, hoping for a perfect match
        let reserveMade = await client.reserves.signupReserve(client, signup.id, raid, item, memberID);
    
        // Hey, we added a reserve item alias table!  Maybe there's a match in there!
        if (!reserveMade) {
            let alias = await client.reserves.aliasSearch(client, item);
            if (alias) {
                reserveMade = await client.reserves.signupReserve(client, signup.id, raid, parseInt(alias.reserveItemID), memberID);
            }
        }
    
        // Our initial try failed, let's try looking it up on nexushub
        if (!reserveMade) {
            if (item.length > 2 && item.length < 100) {
                let itemInfo = await client.nexushub.item(item);
                if (itemInfo) {
                    reserveMade = await client.reserves.signupReserve(client, signup.id, raid, itemInfo.name, memberID);
                }
            }
        }
    
        // That still isn't working.  Let's see if we can find this as a fragment?
        if (!reserveMade) {
            let likeItem = await client.reserves.likeSearch(client, raid, item);
            // Hooray, it worked!
            if (likeItem.length == 1) {
                let itemInfo = likeItem.shift();
                reserveMade = await client.reserves.signupReserve(client, signup.id, raid, itemInfo.name, memberID);
            }
    
            // Uh oh, we found multiple.  Better let the user know!
            if (likeItem.length > 1) {
                let possibleItems = [];
                for (key in likeItem) {
                    possibleItems.push(likeItem[key].name);
                }

                return {result: -1, message: "I found " + possibleItems.length + " items that matched `" + item + "`:\n" + possibleItems.join("\n") + "\nPlease re-enter your reserve using the full item name!"};
            }
        }
        
        if (!reserveMade) {
            // We failed :(
            return {result: -1, message: "I'm sorry, I was unable to find **" + item + "** in the list of available items for **" + raid.raid.toUpperCase() + "**."};
        } else {
            // Return the reserve!
            reserve = await client.models.raidReserve.findOne({ where: { signupID: signup.id, raidID: raid.id }, order: [['updatedAt', 'DESC']], include: includes });
            return {
                result: 1, 
                data: {
                    item: reserve.item.name,
                    name: signup.player
                }
            };
        }
    },    
    aliasSearch: (client, item) => {
        let promise = new Promise((resolve, reject) => {
            client.models.reserveItemAlias.findOne({where: {'alias': item.toLowerCase()}}).then((item) => { 
                resolve(item);
            });
        });
    
        return promise;
    },
    likeSearch: (client, raid, item) => {
        let promise = new Promise((resolve, reject) => {
            client.models.reserveItem.findAll({where: client.reserves.generateWhere(raid, item, true)}).then((items) => {
                resolve(items);
            });
        });
    
        return promise;
    },
    findAltSignup: (client, raidID, alts) => {
        let promise = new Promise((resolve, reject) => {
            alts.forEach((alt) => {
                signup = client.reserves.findSignup(client, raidID, alt.name);
                if (signup) {
                    resolve(signup);
                }
            });
            resolve(null);
        });   
        return promise;
    },
    findSignup: (client, raidID, player) => {
        let promise = new Promise((resolve, reject) => {
            client.models.signup.findOne({ where: { raidID: raidID, player: player } }).then((signup) => {
                resolve(signup);
            });
        });   
    
        return promise;
    },
    generateWhere: (raid, item, like) => {
        raidParts = raid.raid.split('+');
        let raidSections = [];
        raidParts.forEach((part) => {
            if (like) {
                raidSections.push({ raid: part, name: {[Op.like]: '%' + item + '%'}});
            } else {
                raidSections.push({ raid: part, name: item });
            }
        });
    
        let returnObj = {
            [Op.or]: raidSections
        };
        return returnObj;
    },
    signupReserve: (client, signupID, raid, item, memberID) => {
        let promise = new Promise((resolve, reject) => {
            let whereClause;
            if (Number.isInteger(item)) {
                whereClause = {'id': item, 'raid': raid.raid};
            } else {
                whereClause = client.reserves.generateWhere(raid, item, false);
            }
    
            client.models.reserveItem.findOne({ where: whereClause }).then(async (reserveItem) => {
                
                if (reserveItem) {
                    record = {
                        raidID: raid.id,
                        reserveItemID: reserveItem.id,
                        signupID: signupID,
                        memberID: memberID
                    };
                    includes = [
                        {model: client.models.reserveItem, as: 'item', foreignKey: 'reserveItemID'}
                    ];
                    
    
                    // Check if the player already has an existing reserve
                    client.models.raidReserve.findAll({ where: { signupID: signupID, raidID: raid.id }, order: [['updatedAt', 'ASC']], include: includes }).then(async (raidReserves) => {
                        
                        // Check if the player already has a reserve on this item
                        let reserveExists = await client.models.raidReserve.findOne({ where: record });
                        if (reserveExists) { 
                            return resolve(true); 
                        }
    
                        let reserveLimit = raid.reserveLimit ? raid.reserveLimit : 1;
                        if (raidReserves.length >= reserveLimit) {
                            let raidReserve = raidReserves[0];
                            await client.models.raidReserve.update({ reserveItemID: reserveItem.id, memberID: memberID }, { where: { id: raidReserve.id } });
                            return resolve(true);
                        } else {
                            client.models.raidReserve.create(record).then((record) => {
                                return resolve(true);
                            });
                        }
                    });
                } else {
                    return resolve(false);
                }
            });
        });
    
        return promise;
    },
	byRaid: async function(client, raid) {
        let promise = new Promise((resolve, reject) => {

            let includes = [
                {model: client.models.signup, as: 'signup', foreignKey: 'signupID'},
                {model: client.models.reserveItem, as: 'item', foreignKey: 'reserveItemID'},
            ];

            client.models.raidReserve.findAll({where: {RaidID: raid.id}, include: includes}).then((raidReserves) => {
                let returnMessage = '';
                raidReserves.sort((a, b) => {
                    if (a.item.name > b.item.name) {
                        return 1;
                    }
                    if (a.item.name < b.item.name) {
                        return -1;
                    }
                    if (a.signup.player > b.signup.player) {
                        return 1;
                    }
                    if (a.signup.player < b.signup.player) {
                        return -1;
                    }
                    return 0;
                });
                let reserveList = [];
                raidReserves.forEach((reserve) => {
                    // Only show reserves from players who have a sign-up of 'yes'
                    if (reserve.signup.signup == 'yes') { 
                        reserveList.push({ 
                            'player': reserve.signup.player,
                            'item': reserve.item.name,
                            'itemID': reserve.item.id,
                            'reserveTime': moment(reserve.updatedAt).utcOffset(-240).format('h:mm A, L')
                        });
                    }
                });
                resolve(reserveList);
            });
        });
        return promise;
    }
};