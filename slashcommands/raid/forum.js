const { ActionRowBuilder , StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, ChannelType } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('forum')
    .setDescription('Form Test.');


exports.data = commandData;

exports.run = async (client, interaction) => {
    console.log(ChannelType);
    // interaction.guild.channels.create("Test", {
    //     type: 'forum'
    // });
    return interaction.reply({content:'Test.', ephemeral: true});
}

