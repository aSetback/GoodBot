const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('reserve')
    .setDescription('Soft reserve an item for the raid.')
    .addStringOption(option =>
		option
            .setName('reserve')
			.setDescription('Item Name')
			.setRequired(false)
    )
    .addStringOption(option =>
		option
            .setName('character')
			.setDescription('Character Name')
			.setRequired(false)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {
    let args = {
        character: interaction.options.getString('character'),
        reserve: interaction.options.getString('reserve')
    };

    if (args.reserve) {
    interaction.deferReply({ephemeral: true});
        if (!args.character) {
            args.character = interaction.member.nickname ? interaction.member.nickname : interaction.user.username;
        }
        reserveItem(client, interaction, args);
    } else {
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
}

exports.modalResponse = async (client, interaction) => {
    interaction.deferReply({ephemeral: true});
    let args = {
        character: interaction.fields.getTextInputValue('character'),
        reserve: interaction.fields.getTextInputValue('reserve')
    };
    reserveItem(client, interaction, args);
}
 
async function reserveItem(client, interaction, args) {
    // Get our raid information
    let raid = await client.raid.get(client, interaction.channel);

    // Make sure this is actually a raid!
    if (!raid) {
        interaction.editReply({content: 'This does not appear to be a raid channel, item reserve has failed.', ephemeral: true});
        return false;
    }

    let reserve = await client.reserves.reserveItem(client, raid, args.character,  args.reserve);
    if (reserve.result == -1) {
        interaction.editReply({content: reserve.msg, ephemeral: true});
    } else {
        let record = {
            raidID: raid.id,
            memberID: interaction.user.id,
            guildID: interaction.guild.id,
            log: 'Command: "' + reserve.data.item + '" has been reserved for **' + args.character + '**.'
        }
        await client.models.reserveLog.create(record);
        let reserveText = 'A soft reserve has been set on ' + reserve.data.item + ' for ' + client.general.ucfirst(args.character) + '.';
        interaction.editReply({content: reserveText, ephemeral: true});
    }
}