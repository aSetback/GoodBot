const fs = require("fs");

exports.run = (client, message, args) => {
    message.delete().catch(O_o=>{});
    client.models.signup.findAll({'where': {'channelID': message.channel.id}}).then((signups) => {
        let msg = '-\n```';
        msg += 'Player'.padEnd(30) + 'Signup'.padEnd(15) + 'Date/Time\n';
        signups.forEach((signup) => {
            if (msg.length > 1500) {
                msg += '```';
                message.author.send(msg);
                msg = '-\n```';
            }
            msg += signup.player.padEnd(30) + signup.signup.padEnd(15) + signup.createdAt + '\n';
        });
        msg += '```';
        message.author.send(msg);
    });
}