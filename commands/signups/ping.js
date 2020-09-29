exports.run = async function(client, message, args) {    
    let type = args.shift();
    let filterArg = args.shift();
    let raid = await client.raid.get(client, message.channel);
    let list = [];

    if (type == 'confirmed') {
        list = raid.signups.filter(signup => signup.confirmed == 1);
    }
    if (type == 'raid') {
        list = raid.signups.filter(signup => signup.signup == 'yes');
    }
    if (type == 'class') {
        list = raid.signups.filter(signup => signup.signup == 'yes' && signup.character.class == filterArg);
    }
    if (type == 'role') {
        list = raid.signups.filter(signup => signup.signup == 'yes' && signup.character.role == filterArg);
    }

    let pingList = [];
    for (key in list) {
        pingList.push(list[key].character.name);
    }
    
    if (pingList.length == 0) {
        message.channel.send('No players were found.');
    } else {
        let notifications = await client.notify.makeList(client, message.guild, pingList);
        message.channel.send(notifications);
    }
}