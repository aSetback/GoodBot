exports.run = async function(client, message, args) {
	let raid = await client.signups.getRaid(client, message.channel);
	let player = args.shift().toLowerCase();
    let item = args.join(' ');

    if (raid.locked) {
        return message.author.send('This raid is locked -- new reserves can not currently be added.');
    }

    // Find this player in the sign-up
    client.models.signup.findOne({where: {raidID: raid.id, player: player}}).then((signup) => {
        if (signup) {
            client.models.reserveItem.findOne({where: {raid: raid.raid, name: item}}).then(async (reserveItem) => {
                if (reserveItem) {
                    record = {
                        raidID: raid.id,
                        reserveItemID: reserveItem.id,
                        signupID: signup.id 
                    };

                    // Check if the player already has an existing reserve
                    client.models.raidReserve.findOne({where: {signupID: signup.id, raidID: raid.id}}).then((raidReserve) => {
                        if (raidReserve) { 
                            client.models.raidReserve.update({reserveItemID: reserveItem.id}, {where: {id: raidReserve.id}});
                            return message.author.send('**' + client.general.ucfirst(player) + '**\'s reserve has been updated to  **' + item + '** for raid **' + raid.raid + '**.');
                        } else {
                            client.models.raidReserve.create(record).then((record) => {
                                return message.author.send('A reserve for **' + item + '** has been added for **' + client.general.ucfirst(player) + '** for raid **' + raid.raid + '**.');
                            });       
                        }
                    });

                } else {
                    // Attempt to find it on Nexushub
                    let itemInfo = await client.nexushub.item(item);
                    client.models.reserveItem.findOne({where: {raid: raid.raid, name: itemInfo.name}}).then((reserveItem) => {
                        if (reserveItem) {
                            record = {
                                raidID: raid.id,
                                reserveItemID: reserveItem.id,
                                signupID: signup.id 
                            };
        
                            // Check if the player already has an existing reserve
                            client.models.raidReserve.findOne({where: {signupID: signup.id, raidID: raid.id}}).then((raidReserve) => {
                                if (raidReserve) { 
                                    client.models.raidReserve.update({reserveItemID: reserveItem.id}, {where: {id: raidReserve.id}});
                                    return message.author.send('**' + client.general.ucfirst(player) + '**\'s reserve has been updated to **' + itemInfo.name + '** for raid **' + raid.raid + '**.');
                                } else {
                                    client.models.raidReserve.create(record).then((record) => {
                                        return message.author.send('A reserve for **' + itemInfo.name + '** has been added for **' + client.general.ucfirst(player) + '** for raid **' + raid.raid + '**.');
                                    });       
                                }
                            });
                        } else {
                            return message.channel.send("I'm sorry, I was unable to find " + item + " in the list of available items for " + raid.raid.toUpperCase());
                        }

                    });
                }
            });
      } else {
            return message.channel.send("We couldn't find " + player + " in the sign-ups for this raid.");
        }
    })
};
