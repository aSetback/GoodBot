const fs = require("fs");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('wavlist')
    .setDescription('Show a list of available wavs.')

exports.data = commandData;

exports.run = async (client, interaction) => {
    let returnMessages = [];
    let returnMessage = '__WAVs:__\n';
	fs.readdir("./wav/", async (err, files) => {
		if (err) return console.error(err);
		files.forEach(file => {
			if (!file.endsWith(".wav")) return;
			if (returnMessage.length > 1500) {
				returnMessages.push(returnMessage);
				returnMessage = '';
			}

			let wav = file.split(".")[0];
			returnMessage += wav + '\n';
		});
        returnMessages.push(returnMessage);

        for (key in returnMessages) {
            returnMessage = returnMessages[key];
            if (key == 0) {
                await interaction.reply({content: returnMessage, ephemeral: true});
            } else {
                interaction.followUp({content: returnMessage, ephemeral: true});
            }
        }
    });
}
