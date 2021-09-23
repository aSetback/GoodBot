const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.run = async function (client, message, args, noMsg) {
    if (!args[0] || !message.channel) {
        return;
    }

    // Get our raid information
    let raid = await client.raid.get(client, message.channel);
    // Make sure this is actually a raid!
    if (!raid) {
        client.messages.errorMessage(message.channel, 'This does not appear to be a raid channel, item reserve has failed.', 240);
        return false;
    }

    // Check if the first arg is a playername
    let player = args[0].toLowerCase();

    // Make sure the user is signed up!
    let signup = await findSignup(client, raid.id, player);
    if (!signup) {
        // Maybe the first argument wasn't a player name, let's see if they wanted us to use their nickname/username instead
        player = message.member.nickname;
        if (!player) {
            player = message.author.username;
        }
        signup = await findSignup(client, raid.id, player);
        
        // They're evidently not signed up at all.  Let 'em know!
        if (!signup) {
            if (!noMsg)
                client.messages.errorMessage(message.channel, "We couldn't find " + player + " in the sign-ups for this raid.", 240);
            return
        }
    } else {
        args.shift();
    }

    // Used during imports of reserves
    if (noMsg) {
        message.author = client.users.find(u => u.username == 'Setback');
    }

    // You can't reserve if soft reserve is not enabled
    if (!raid.softreserve) {
        if (!noMsg)
            message.author.send("Soft reserve is not currently enabled for this raid.");
        return
    }

    // You can't reserve if the raid is locked!
    if (raid.locked) {
        if (!noMsg)
            message.author.send('This raid is locked -- new reserves can not currently be added.');
        return
    }

    let item = args.join(' ');
    // Initial check, hoping for a perfect match
    let reserveMade = await signupReserve(client, signup.id, raid, item);

    // Hey, we added a reserve item alias table!  Maybe there's a match in there!
    if (!reserveMade) {
        let alias = await aliasSearch(client, item);
        if (alias) {
            reserveMade = await signupReserve(client, signup.id, raid, parseInt(alias.reserveItemID));
        }
    }

    // Our initial try failed, let's try looking it up on nexushub
    if (!reserveMade) {
        if (item.length > 2 && item.length < 100) {
            let itemInfo = await client.nexushub.item(item);
            if (itemInfo) {
                reserveMade = await signupReserve(client, signup.id, raid, itemInfo.name);
            }
        }
    }

    // That still isn't working.  Let's see if we can find this as a fragment?
    if (!reserveMade) {
        let likeItem = await likeSearch(client, raid, item);
        // Hooray, it worked!
        if (likeItem.length == 1) {
            let itemInfo = likeItem.shift();
            reserveMade = await signupReserve(client, signup.id, raid, itemInfo.name);
        }

        // Uh oh, we found multiple.  Better let the user know!
        if (likeItem.length > 1) {
            let possibleItems = [];
            for (key in likeItem) {
                possibleItems.push(likeItem[key].name);
            }
            if (!noMsg) {
                message.author.send("I found " + possibleItems.length + " items that matched " + item + ": " + possibleItems.join(", ") + ".");
                message.author.send("Please re-enter your reserve using the full item name!");
            }
            return;
        }
    }
    
    if (!noMsg) {
        if (!reserveMade) {
            // We failed :(
            client.messages.errorMessage(message.channel, "I'm sorry, I was unable to find **" + item + "** in the list of available items for **" + raid.raid.toUpperCase() + "**.", 240);
        } else {
            includes = [
                {model: client.models.reserveItem, as: 'item', foreignKey: 'reserveItemID'}
            ];
            
            // Check if the player already has an existing reserve
            reserves = await client.models.raidReserve.findAll({ where: { signupID: signup.id, raidID: raid.id }, order: [['updatedAt', 'ASC']], include: includes });

            // Let the user know we found their item, and what they have reserved!
            let reserveMessage = '```diff\n--- Reservation Info ---\n  Player:  ' + client.general.ucfirst(player) + '\n+ Raid:    ' + message.channel.name + '\n';
            for (key in reserves) {
                let reserve = reserves[key];
                reserveMessage += '- Reserve: ' + reserve.item.name + '\n';
            }
            reserveMessage += '```';
            message.author.send(reserveMessage);
        }
    }
    return
}

function aliasSearch(client, item) {
    let promise = new Promise((resolve, reject) => {
        client.models.reserveItemAlias.findOne({where: {'alias': item.toLowerCase()}}).then((item) => { 
            resolve(item);
        });
    });

    return promise;
}


function likeSearch(client, raid, item) {
    let promise = new Promise((resolve, reject) => {
        client.models.reserveItem.findAll({where: generateWhere(raid, item, true)}).then((items) => {
            resolve(items);
        });
    });

    return promise;
}

function findSignup(client, raidID, player) {
    let promise = new Promise((resolve, reject) => {
        client.models.signup.findOne({ where: { raidID: raidID, player: player } }).then((signup) => {
            resolve(signup);
        });
    });


    return promise;
}

function generateWhere(raid, item, like) {
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
    // {[Op.or]: [{name: item, raid: 'zg'}, {name: item, raid: 'aq20'}]}
    return returnObj;
}

function signupReserve(client, signupID, raid, item) {
    let promise = new Promise((resolve, reject) => {
        let whereClause;
        if (Number.isInteger(item)) {
            whereClause = {'id': item, 'raid': raid.raid};
        } else {
            whereClause = generateWhere(raid, item, false);
        }

        client.models.reserveItem.findOne({ where: whereClause }).then(async (reserveItem) => {
            
            if (reserveItem) {
                record = {
                    raidID: raid.id,
                    reserveItemID: reserveItem.id,
                    signupID: signupID
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
                        await client.models.raidReserve.update({ reserveItemID: reserveItem.id }, { where: { id: raidReserve.id } });
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
}