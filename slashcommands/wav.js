const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require("fs");

 	let commandData = new SlashCommandBuilder()
	.setName('wav')
	.setDescription('Plays a wav file in your current discord voice channel.')
	.addStringOption(option => {
		option.setName('wav')
		.setDescription('The name of the wav file to play back.')
		.setRequired(true)
		return option;
	});

	exports.data = commandData;