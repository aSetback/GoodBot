const fs = require('fs');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
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
        return interaction.reply({content: 'You must be in a voice channel to play a wav file.', ephemeral: true});
	}
	
	let wav = interaction.options.getString('wav').toLowerCase();
	let filename = './wav/' + wav + '.wav';
	fs.exists(filename, async (exists) => {
		if (exists) {
            interaction.reply({content: 'Playing ' + wav + '.', ephemeral: true});
			let connection = joinVoiceChannel({
				channelId: vc.id,
				guildId: vc.guild.id,
				adapterCreator: vc.guild.voiceAdapterCreator,
			});
			let player = createAudioPlayer();
			let resource = createAudioResource(filename);
			connection.subscribe(player);
			player.play(resource);
			player.on('error', error => {
				console.error("Error: " + error.message);
			});
			player.on(AudioPlayerStatus.Idle, () => {
				connection.destroy();
				player.stop();
			});
		} else {
            interaction.reply({content: 'The request wav file does not exist.', ephemeral: true});
		}
	})
}
