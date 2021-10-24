const { Guild } = require('discord.js');
const fs = require('fs');

exports.run = async (client, message, args) => {
	return message.author.send('The wav command is temporarily disabled as I rewrite the command for discordJS v13.  This should be back up in the next week.');


	if (!message.member) {
		return false;
	}

	console.log(message.member.voice);

	var vc = message.member.voice.channel;
	if (!vc) {
		return client.messages.send(message.channel, 'You must be in a voice channel to play a wav file.', 240);
	}
	
	if (!args[0]) {
		return client.messages.send(message.channel, 'You need to include which wav you want played.  Proper usage is: `+wav WavName`.  For a list of wavs, please use `+wavlist`.', 240);
	}
	
	if (message.guild.voice && message.guild.voice.channelID) {
		return client.messages.send(message.channel, 'Another wav file is already playing!', 240);
	}
	
	var wav = args[0].toLowerCase();
	var filename = './wav/' + wav + '.wav';
	fs.exists(filename, async (exists) => {
		if (exists) {
			let connection = await vc.join();
			let dispatcher = connection.play(filename);
			dispatcher.on('finish', () => {
				setTimeout(() => {
					vc.leave();
				}, 1000);
			});
		} else {
			return client.messages.send(message.channel, 'The request wav file does not exist.', 240);
		}
	})
}