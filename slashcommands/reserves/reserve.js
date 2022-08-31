const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('reserve')
    .setDescription('Open a modal to reserve an item.');

exports.data = commandData;

exports.run = async (client, interaction) => {
    let modal = new Modal()
        .setCustomId('sc-modal-reserve')
        .setTitle('Reserve an Item');

    let input1 = new TextInputComponent()
        .setCustomId('reserve')
        .setLabel('What would you like to reserve?')
        .setRequired(true)
        .setStyle('SHORT');

    let input2 = new TextInputComponent()
        .setCustomId('character')
        .setLabel('Who is the reserve for?')
        .setValue(interaction.member.nickname ? interaction.member.nickname : interaction.user.username)
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
        reserve: interaction.fields.getTextInputValue('reserve')
    };
 
    // Get our raid information
    let raid = await client.raid.get(client, interaction.channel);

    // Make sure this is actually a raid!
    if (!raid) {
        interaction.reply({content: 'This does not appear to be a raid channel, item reserve has failed.', ephemeral: true});
        return false;
    }

    let reserve = await client.reserves.reserveItem(client, raid, args.character,  args.reserve);
    if (reserve.result == -1) {
        interaction.reply({content: reserve.msg, ephemeral: true});
    } else {
        let reserveText = 'A soft reserve has been set on ' + reserve.data.item + ' for ' + client.general.ucfirst(args.character) + '.';
        interaction.reply({content: reserveText, ephemeral: true});
    }
}
 
