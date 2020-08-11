exports.run = async function (client, message, args) {
    if (!client.permission.manageChannel(message.member, message.channel)) {
        return false;
    }
    let signupString = args.join('');
    let players = signupString.split(',');
    for (key in players) {
        let playerName = client.general.ucfirst(players[key]);
        let raid = await client.raid.get(client, message.channel);
        if (raid) {
            let signup = await client.raid.getSignup(client, raid, playerName); ``
            if (signup) {
                if (signup.noshow) {
                    client.models.signup.update({ noshow: false }, { where: { id: signup.id } });
                    message.author.send(playerName + ' is no longer set as a no-show for ' + message.channel.name + '.');
                } else {
                    client.models.signup.update({ noshow: true }, { where: { id: signup.id } });
                    message.author.send(playerName + ' was set as a no-show for ' + message.channel.name + '.');
                }
            }
        }
    }
};