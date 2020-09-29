exports.run = async function(client, message, args) {    
    let type = args.shift();
    let filterArg = args.shift();
    let raid = await client.raid.get(client, message.channel);
    if (!raid) {
        return client.messages.errorMessage(message.channel, 'This command can only be used in a raid channel.', 240);
    }

    let list = [];

    if (type == 'confirmed') {
        list = raid.signups.filter(signup => signup.confirmed == 1);
    }
    if (type == 'raid') {
        list = raid.signups.filter(signup => signup.signup == 'yes');
    }
    if (type == 'class') {
        list = raid.signups.filter(signup => signup.signup == 'yes' && signup.character.class.toLowerCase() == filterArg.toLowerCase());
    }
    if (type == 'role') {
        list = raid.signups.filter(signup => signup.signup == 'yes' && signup.character.role.toLowerCase() == filterArg.toLowerCase());
    }

    let pingList = [];
    for (key in list) {
        pingList.push(list[key].character.name);
    }
    
    if (pingList.length == 0) {
        return client.messages.errorMessage(message.channel, 'No players were found.', 240);
    } else {
        let notifications = await client.notify.makeList(client, message.guild, pingList);
        return message.channel.send(notifications);
    }
}