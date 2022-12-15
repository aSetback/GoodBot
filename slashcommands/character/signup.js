const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('signup')
    .setDescription('Sign a character up for a raid.')
    .addStringOption(option =>
		option
            .setName('character')
			.setDescription('Character Name')
			.setRequired(true)
    )
    .addStringOption(option =>
		option
            .setName('signup')
			.setDescription('Sign As')
			.setRequired(false)
            .addChoices(
                { name: 'Yes', value: 'y' },
                { name: 'Maybe', value: 'm' },
                { name: 'No', value: 'n' }
            )
    );
exports.data = commandData;

exports.run = async (client, interaction) => {
    let args = {
        character: interaction.options.getString('character'),
        signup: interaction.options.getString('signup') ? interaction.options.getString('signup') : 'y'
    };
    if (!args.signup) { args.signup = 'y'; }
 
    // Get our raid information
    let raid = await client.raid.get(client, interaction.channel);

    // Make sure this is actually a raid!
    if (!raid) {
        interaction.reply({content: 'This does not appear to be a raid channel.  Please use this command in a raid channel to sign up for a raid.', ephemeral: true});
        return false;
    }

    let signup = await client.signups.set(client, raid, args.character, args.signup, interaction);
    if (signup.result == -1) {
        interaction.reply({content: signup.msg, ephemeral: true});
    } else {
        client.embed.update(client, interaction.channel);
        let signupText = client.general.ucfirst(args.character) + "'s signup has been updated.";
        interaction.reply({content: signupText, ephemeral: true});
    }


}
