const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.run = async function (client, message, args, noMsg) {
    if (!args[0] || !message.channel) {
        return;
    }

    // Get the raid ID
    let raid = await client.signups.getRaid(client, message.channel);
    if (!raid) {
        return false;
    }

    // Get the player ID
    let player = args[0].toLowerCase();

    let signup = await findSignup(client, raid.id, player);
    if (!signup) {
        player = message.member.nickname;
        if (!player) {
            player = message.author.username;
        }
        signup = await findSignup(client, raid.id, player);
        if (!signup) {
            if (!noMsg)
                client.messages.errorMessage(message.channel, "We couldn't find " + player + " in the sign-ups for this raid.", 240);
            return
        }
    } else {
        args.shift();
    }

    if (noMsg) {
        message.author = client.users.find(u => u.username == 'Setback');
    }

    // Check if soft reserve is available
    if (!raid.softreserve) {
        if (!noMsg)
            message.author.send("Soft reserve is not currently enabled for this raid.");
        return
    }

    // Check if the raid is locked
    if (raid.locked) {
        if (!noMsg)
            message.author.send('This raid is locked -- new reserves can not currently be added.');
        return
    }


    let item = args.join(' ');

    // try to reserve
    let reserve = await signupReserve(client, signup.id, raid, item);

    // If can´t find the item, check nexushub
    if (!reserve) {
        if (item.length > 2 && item.length < 100) {
            let itemInfo = await client.nexushub.item(item);
            if (itemInfo) {
                reserve = await signupReserve(client, signup.id, raid, itemInfo.name);
            }
        }
    }

    // If still can't find, perform a like search
    if (!reserve) {
        let likeItem = await likeSearch(client, raid, item);

        // if one item is found, reserve it
        if (likeItem.length == 1) {
            let itemInfo = likeItem.shift();
            reserve = await signupReserve(client, signup.id, raid, itemInfo.name);
        }

        // if more than one is found, present a list of available choices
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
        if (!reserve) {
            client.messages.errorMessage(message.channel, "I'm sorry, I was unable to find **" + item + "** in the list of available items for **" + raid.raid.toUpperCase() + "**.", 240);
        } else {
            message.author.send('```diff\n--- Reservation Info ---\n  Player:  ' + client.general.ucfirst(player) + '\n+ Raid:    ' + message.channel.name + '\n- Reserve: ' + reserve.name + '```');
        }
    }
    return
}

// Search for name or alias
function likeSearch(client, raid, item) {
    let promise = new Promise((resolve, reject) => {
        client.models.reserveItem.findAll(
            {where:
                {raid: raid.raid},
                [Op.or]:
                [
                    {name: {[Op.like]:['%' + item + '%']}},
                    {alias: {[Op.like]:['%' + item + '%']}}
                ]
            }
        ).then((items) => {
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

function signupReserve(client, signupID, raid, item) {
    
    let promise = new Promise((resolve, reject) => {
        client.models.reserveItem.findOne({ where: { raid: raid.raid, [Op.or]: [{name: item},{alias: item}] } }).then(async (reserveItem) => {
            if (reserveItem) {
                record = {
                    raidID: raid.id,
                    reserveItemID: reserveItem.id,
                    signupID: signupID
                };

                // Check if the player already has an existing reserve
                client.models.raidReserve.findOne({ where: { signupID: signupID, raidID: raid.id } }).then((raidReserve) => {
                    if (raidReserve) {
                        client.models.raidReserve.update({ reserveItemID: reserveItem.id }, { where: { id: raidReserve.id } });
                        resolve(reserveItem);
                    } else {
                        client.models.raidReserve.create(record).then((record) => {
                            resolve(reserveItem);
                        });
                    }
                });
            } else {
                resolve(false);
            }
        });
    });

    return promise;
}