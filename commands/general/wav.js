const fs = require('fs');

exports.run = (client, message, args) => {

	if (!message.member) {
		return false;
	}

	var vc = message.member.voiceChannel;
	if (!vc) {
		return message.channel.send('Must be in voice channel.');
	}
	
	if (!args[0]) {
		return message.channel.send('Wav file required.');
	}
	
	var wav = args[0].toLowerCase();
	var filename = './wav/' + wav + '.wav';
	fs.exists(filename, function(exists) {
		if (exists) {
			vc.join()
				.then(connection => {
					const dispatcher = connection.playFile(filename);
					dispatcher.on('end', end => {
						vc.leave()
					});
				})
				.catch(console.error);
		} else {
			return message.channel.send('Wav file does not exist');
		}
	})
}