const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.run = async function (client, message, args) {
    let raid = await client.signups.getRaid(client, message.channel);
    let player = args[0].toLowerCase();

    if (!raid.softreserve) {
        return message.author.send("Soft reserve is not currently enabled for this raid.");
    }

    if (raid.locked) {
        return message.author.send('This raid is locked -- new reserves can not currently be added.');
    }

    let signup = await findSignup(client, raid.id, player);
    if (!signup) {
        player = message.member.nickname;
        if (!player) {
            player = message.author.username;
        }
        signup = await findSignup(client, raid.id, player);
        if (!signup) {
            return message.channel.send("We couldn't find " + player + " in the sign-ups for this raid.");
        }
    } else {
        args.shift();
    }

    let item = args.join(' ');

    let reserve = await signupReserve(client, signup.id, raid, item);
    if (!reserve) {
        let itemInfo = await client.nexushub.item(item);
        if (itemInfo) {
            reserve = await signupReserve(client, signup.id, raid, itemInfo.name);
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
            message.author.send("I found " + possibleItems.length + " items that matched " + item + ": " + possibleItems.join(", ") + ".");
            return message.author.send("Please re-enter your reserve using the full item name!");s
        }
    }

    if (!reserve) {
        return message.channel.send("I'm sorry, I was unable to find **" + item + "** in the list of available items for **" + raid.raid.toUpperCase() + "**.");
    } else {
        return message.author.send('A reserve for **' + reserve.name + '** has been added for **' + client.general.ucfirst(player) + '** for raid **' + raid.raid.toUpperCase() + '**.');
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