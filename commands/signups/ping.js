exports.run = async function(client, message, args) {
    
    let type = args.shift();
    if (type == 'confirmed') {
        let raid = await client.signups.getRaid(client, message.channel);
        let confirmed = await client.signups.getConfirmed(client, raid);
        let pingList = [];
        for (key in confirmed) {
            pingList.push(confirmed[key].player);
        }
        if (pingList) {
            let mentionText = await client.notify.makeList(client, message.guild, pingList);
            message.channel.send(mentionText);
        }

    }

}