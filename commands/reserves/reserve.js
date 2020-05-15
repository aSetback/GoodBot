const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.run = async function (client, message, args, noMsg) {
    let raid = await client.signups.getRaid(client, message.channel);
    if (!args[0]) {
        return;
    }
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

    if (!raid.softreserve) {
        if (!noMsg)
            message.author.send("Soft reserve is not currently enabled for this raid.");
        return
    }

    if (raid.locked) {
        if (!noMsg)
            message.author.send('This raid is locked -- new reserves can not currently be added.');
        return
    }

    let item = args.join(' ');

    let reserve = await signupReserve(client, signup.id, raid, item);
    if (!reserve) {
        if (item.length > 2) {
            let itemInfo = await client.nexushub.item(item);
            if (itemInfo) {
                reserve = await signupReserve(client, signup.id, raid, itemInfo.name);
            }
        }
    }

    if (!reserve) {
        let likeItem = await likeSearch(client, raid, item);
        if (likeItem.length == 1) {
            let itemInfo = likeItem.shift();
            reserve = await signupReserve(client, signup.id, raid, itemInfo.name);
        }
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
    
    if (!reserve) {
        if (!noMsg)
            client.messages.errorMessage(message.channel, "I'm sorry, I was unable to find **" + item + "** in the list of available items for **" + raid.raid.toUpperCase() + "**.", 240);
        return
    } else {
        message.author.send('```diff\n--- Reservation Info ---\n  Player:  ' + client.general.ucfirst(player) + '\n+ Raid:    ' + message.channel.name + '\n- Reserve: ' + reserve.name + '```');
    }
}

function likeSearch(client, raid, item) {
    let promise = new Promise((resolve, reject) => {
        client.models.reserveItem.findAll({where: { name: {[Op.like]: '%' + item + '%'}, raid: raid.raid}}).then((items) => {
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
        client.models.reserveItem.findOne({ where: { raid: raid.raid, name: item } }).then(async (reserveItem) => {
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