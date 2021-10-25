const fs = require('fs');
const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer } = require('@discordjs/voice');
const { createAudioResource } = require('@discordjs/voice');
const { AudioPlayerStatus } = require('@discordjs/voice');

exports.run = async (client, message, args) => {

	if (!message.member) {
		return false;
	}

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
			let connection = joinVoiceChannel({
				channelId: vc.id,
				guildId: vc.guild.id,
				adapterCreator: vc.guild.voiceAdapterCreator,
			});
			let player = createAudioPlayer();
			let resource = createAudioResource(filename);
			player.play(resource);
			connection.subscribe(player);
			player.on(AudioPlayerStatus.Idle, () => {
				connection.destroy();
				player.stop();
			});
		} else {
			return client.messages.send(message.channel, 'The request wav file does not exist.', 240);
		}
	})
}
