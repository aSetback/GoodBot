const fs = require('fs');

exports.run = (client, message, args) => {

	if (!message.member) {
		return false;
    }
    
    let name = args.shift();
    let wav = args.shift();
    if (!name && !wav) {
        return false;
    }

    let whereArg = {where: {name: name, guildID: message.guild.id}};
    if (wav == 'remove') {
        client.models.joinwav.destroy(whereArg).then(() => {
            message.channel.send('Join wav removed for **' + client.general.ucfirst(name) + '**.');
        });
    } else {
        client.models.joinwav.findOne(whereArg).then((joinwav) => {
            if (joinwav) {
                client.models.joinwav.update({wav: wav}, whereArg).then(() => {
                    message.channel.send('Join wav updated to **' + wav + '** for **' + client.general.ucfirst(name) + '**.');
                });
            } else {
                client.models.joinwav.create({
                    name: name,
                    wav: wav,
                    guildID: message.guild.id
                }).then(() => {
                    message.channel.send('Join wav set to **' + wav + '** for **' + client.general.ucfirst(name) + '**.');
                });
            }
        });
    }
}