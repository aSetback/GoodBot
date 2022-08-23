const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('signup')
    .setDescription('Sign a character up for a raid.');

exports.data = commandData;

exports.run = async (client, interaction) => {
    let modal = new Modal()
        .setCustomId('sc-modal-signup')
        .setTitle('Sign up for raid');

    let input1 = new TextInputComponent()
        .setCustomId('character')
        .setLabel('Which character are you signing up?')
        .setRequired(true)
        .setStyle('SHORT');

    let input2 = new TextInputComponent()
        .setCustomId('signup')
        .setLabel('What would you like to set this signup to?')
        .setRequired(true)
        .setStyle('SHORT');

        let ActionRow1 = new MessageActionRow().addComponents(input1);
        let ActionRow2 = new MessageActionRow().addComponents(input2);
        modal.addComponents([ActionRow1, ActionRow2]);

    await interaction.showModal(modal);
}

exports.modalResponse = async (client, interaction) => {
    let args = {
        character: interaction.fields.getTextInputValue('character'),
        signup: interaction.fields.getTextInputValue('signup')
    };
 
    // Get our raid information
    let raid = await client.raid.get(client, interaction.channel);

    // Make sure this is actually a raid!
    if (!raid) {
        interaction.reply({content: 'This does not appear to be a raid channel.  Please use this command in a raid channel to sign up for a raid.', ephemeral: true});
        return false;
    }

    let signup = await client.signups.set(client, raid, args.character, args.signup, interaction.member.id);
    if (signup.result == -1) {
        interaction.reply({content: signup.msg, ephemeral: true});
    } else {
        client.embed.update(client, interaction.channel);
        let signupText = client.general.ucfirst(args.character) + "'s signup has been updated.";
        interaction.reply({content: signupText, ephemeral: true});
    }
}
