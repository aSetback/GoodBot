const fs = require('fs');
const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer } = require('@discordjs/voice');
const { createAudioResource } = require('@discordjs/voice');
const { AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');

exports.run = async (client, message, args) => {

	if (!message.member) {
		return false;
	}

	var vc = message.member.voice.channel;
	if (!vc) {
		return client.messages.send(message.channel, 'You must be in a voice channel to play a youtube URL.', 240);
	}
	
	if (!args[0]) {
		return client.messages.send(message.channel, 'You need to include which youtube URL you want played.', 240);
	}
	
	let songURL = args[0];
    let connection = joinVoiceChannel({
        channelId: vc.id,
        guildId: vc.guild.id,
        adapterCreator: vc.guild.voiceAdapterCreator,
    });
    let player = createAudioPlayer();
    let stream = await ytdl(songURL, {
        quality: 'highestaudio',
        highWaterMark: 1024 * 1024 * 1,
        filter: 'audioonly'
    });
    stream.on('error', err => { 
        return 'Error';
    });
    let resource = createAudioResource(stream);
    player.play(resource);
    connection.subscribe(player);
    player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
        player.stop();
    });
}
