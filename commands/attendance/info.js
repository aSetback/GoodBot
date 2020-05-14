exports.run = async function (client, message, args) {
    let playerName = client.general.ucfirst(args[0]);
    let main = await client.character.get(client, playerName, message.guild.id);
    if (main.mainID) {
        main = await client.character.getByID(client, main.mainID);
    }
    let alts = await client.character.getAlts(client, main);
    let characterNames = [main.name];

    let returnMsg = '```md\n';
    returnMsg += '  Player'.padEnd(25) + 'Class'.padEnd(25) + 'Role\n';
    returnMsg += ''.padEnd(65, '=') + '\n';
    returnMsg += '* ' + main.name.padEnd(23) + client.general.ucfirst(main.class).padEnd(25) + client.general.ucfirst(main.role) + '\n';
    for (key in alts) {
        let alt = alts[key];
        characterNames.push(alt.name);
        returnMsg += '  ' + alt.name.padEnd(23) + client.general.ucfirst(alt.class).padEnd(25) + client.general.ucfirst(alt.role) + '\n';
    }
    returnMsg += '```';
    message.author.send(returnMsg);

    let signups = await client.raid.getSignupsByName(client, characterNames, message.guild.id);
    let signupMsg = '```md\n';
    signupMsg += 'Date'.padEnd(12) + 'Character'.padEnd(15) + 'Raid'.padEnd(22) + 'Signed As'.padEnd(12) + 'Confirmed'.padEnd(12) + 'Soft Reserve\n';
    signupMsg += ''.padEnd(100, '=') + '\n';

    for (key in signups) {
        let signup = signups[key];
        let channel = message.guild.channels.find(c => c.id == signup.raid.channelID)
        let confirmed = '-';
        if (signup.raid.confirmation) {
            confirmed = signup.confirmed ? 'yes' : 'no';
        } 
        let reserve = '-';
        if (signup.raid.softreserve) { 
            reserve = signup.reserve ? signup.reserve.item.name : 'not set';
        }
        signupMsg += signup.raid.date.padEnd(12) + signup.player.padEnd(15) + channel.name.padEnd(22) + signup.signup.padEnd(12) + confirmed.padEnd(12) + reserve + '\n';
    }
    signupMsg += '```';
    message.author.send(signupMsg);
}