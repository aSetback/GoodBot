const fs = require('fs');

module.exports = (client, oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel

    if (newUserChannel) {
        let user = newMember.nickname ? newMember.nickname : newMember.user.username;
        client.models.joinwav.findOne({ where: { name: user, guildID: newMember.guild.id } }).then((joinwav) => {
            if (joinwav) {
                var vc = newUserChannel
                var wav = joinwav.wav;
                var filename = './wav/' + wav + '.wav';
                console.log(filename);
                fs.exists(filename, function (exists) {
                    if (exists) {
                        vc.join()
                            .then(connection => {
                                const dispatcher = connection.playFile(filename);
                                dispatcher.on('end', end => {
                                    setTimeout(() => {
                                        vc.leave();
                                    }, 1000);
                                });
                            })
                            .catch(console.error);
                    } else {
                        console.log('Wav file does not exist.');
                    }
                });
            }
        });
    }
};
