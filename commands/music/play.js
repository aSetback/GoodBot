const fs = require('fs');
const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer } = require('@discordjs/voice');
const { createAudioResource } = require('@discordjs/voice');
const { AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');

exports.run = async (client, message, args) => {
    // Make sure this isn't a DM
	if (!message.member) {
		return false;
	}

    // Verify the user is in a voice chat
	var vc = message.member.voice.channel;
    if (!vc) {
		return client.messages.send(message.channel, 'You must be in a voice channel to play a youtube URL.', 240);
	}
	
    // Verify the song URL is a youtube link
	if (!args[0]) {
		return client.messages.send(message.channel, 'You need to include which youtube URL you want played.', 240);
	}
	
    // Verify it's a valid URL
	let songURL = args[0];
    if (songURL.indexOf('youtube.com') < 0) {
        return client.messages.send(message.channel, 'You need to include which youtube URL you want played.', 240);
    }

    // Join the voice channel
    let connection = joinVoiceChannel({
        channelId: vc.id,
        guildId: vc.guild.id,
        adapterCreator: vc.guild.voiceAdapterCreator,
    });

    // Create the audio player
    let player = createAudioPlayer();

    // Create the stream from Youtube
    let stream = await ytdl(songURL, {
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
        filter: 'audioonly'
    });

    // Create our audio resource
    let resource = createAudioResource(stream);

    // Play the audio resource
    player.play(resource);

    // Subscribe this voice connection to the player
    connection.subscribe(player);

    // Add event handling on the song finishing.
    player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
        player.stop();
    });
}
