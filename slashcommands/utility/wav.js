const fs = require('fs');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('wav')
    .setDescription('Play a wav in your voice channel.')
    .addStringOption(option =>
		option
            .setName('wav')
			.setDescription('WAV name')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {

    let vc = interaction.member.voice.channel;
	if (!vc) {
		console.log(interaction.member);
        return interaction.reply({content: 'You must be in a voice channel to play a wav file.', ethereal: true});
	}
	
	let wav = interaction.options.getString('wav').toLowerCase();
	let filename = './wav/' + wav + '.wav';
	fs.exists(filename, async (exists) => {
		if (exists) {
            interaction.reply({content: 'Playing ' + wav + '.', ethereal: true});
			let connection = joinVoiceChannel({
				channelId: vc.id,
				guildId: vc.guild.id,
				adapterCreator: vc.guild.voiceAdapterCreator,
			});
			try {
				await entersState(connection, VoiceConnectionStatus.Ready, 10_000);
				let player = createAudioPlayer();
				let resource = createAudioResource(filename);
				connection.subscribe(player);
				player.play(resource);
				player.on(AudioPlayerStatus.Idle, () => {
					connection.destroy();
					player.stop();
				});
			} catch (err) {
				connection.destroy();
				console.error('[wav] Failed to connect to voice channel:', err.message);
			}
		} else {
            interaction.reply({content: 'The request wav file does not exist.', ethereal: true});
		}
	})
}
