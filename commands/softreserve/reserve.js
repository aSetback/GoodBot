exports.run = async function(client, message, args) {
	let raid = await client.signups.getRaid(client, message.channel);
	let player = args.shift().toLowerCase();
    let item = args.join(' ');

    // Find this player in the sign-up
    client.models.signup.findOne({where: {raidID: raid.id, player: player}}).then((signup) => {
        if (signup) {
            client.models.reserveItem.findOne({where: {raid: raid.raid, name: item}}).then((reserveItem) => {
                if (reserveItem) {
                    record = {
                        raidID: raid.id,
                        reserveItemID: reserveItem.id,
                        signupID: signup.id 
                    };
                    client.models.raidReserve.create(record).then((record) => {
                        return message.author.send("Your reserve for " + item + " has been added!");
                    })
                } else {
                    return message.channel.send("Unable to find " + item + " in the list of available items for " + raid.raid.toUpperCase());
                }
            });

        
        } else {
            return message.channel.send("We couldn't find " + player + " in the sign-ups for this raid.");
        }
    })


};