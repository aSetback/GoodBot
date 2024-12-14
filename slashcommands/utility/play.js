const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const ytdl = require('@distube/ytdl-core');

let commandData = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a youtube video in your voice channel.')
    .addStringOption(option =>
		option
            .setName('video')
			.setDescription('Youtube video URL')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {

    // Verify the user is in a voice chat
	var vc = interaction.member.voice.channel;
    if (!vc) {
        return interaction.reply({content: 'You must be in a voice channel to play a youtube URL.', ephemeral: true});
	}

    // Verify it's a valid URL
	let songURL = interaction.options.getString('video');
    if (songURL.indexOf('youtube.com') < 0) {
        return interaction.reply({content: 'You need to include which youtube URL you want played.', ephemeral: true});
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
    var info = await ytdl.getBasicInfo(songURL)
    var title = info.videoDetails.title;
    let stream = ytdl(songURL).pipe(fs.createWriteStream('video.mp4'));

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
    interaction.reply({content: 'Playing: ' + title, ephemeral: true});
}
