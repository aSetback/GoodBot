const { ActionRowBuilder , StringSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('addrules')
    .setDescription('Add a rule set.');

exports.data = commandData;

exports.run = async (client, interaction) => {
    let modal = new ModalBuilder()
        .setCustomId('sc-modal-addrules')
        .setTitle('Create a Rule');
    let input1 = new TextInputBuilder()
        .setCustomId('name')
        .setLabel('Rules Name')
        .setRequired(true)
        .setStyle('Short');
    let input2 = new TextInputBuilder()
        .setCustomId('rules')
        .setLabel('Rules')
        .setRequired(true)
        .setStyle('Paragraph');  

    let ActionRow1 = new ActionRowBuilder().addComponents(input1);
    let ActionRow2 = new ActionRowBuilder().addComponents(input2);
    modal.addComponents([ActionRow1, ActionRow2]);

    await interaction.showModal(modal);
}

exports.modalResponse = async (client, interaction) => {
    let raid = {
        name: interaction.fields.getTextInputValue('name'),
        rules: interaction.fields.getTextInputValue('rules')
    };

    client.models.raidRules.findOne({where: {name: raid.name, guildID: interaction.guild.id}}).then((raidRules) => {
        let record = {
            name: raid.name,
            rules: raid.rules,
            guildID: interaction.guild.id
        };
        if (raidRules) {
            client.models.raidRules.update(record, {where: {id: raidRules.id}});
        } else {
            client.models.raidRules.create(record);
        }
        interaction.reply('Rules "' + raid.name + '" has been updated.');
    });
}