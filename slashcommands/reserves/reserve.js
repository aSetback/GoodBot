const { MessageActionRow, MessageSelectMenu, Modal, TextInputComponent } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('reserve')
    .setDescription('Soft reserve an item for the raid.')
    .addStringOption(option =>
		option
            .setName('reserve')
			.setDescription('Item Name')
			.setRequired(true)
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

    interaction.deferReply({ephemeral: true});
        if (!args.character) {
            args.character = interaction.member.nickname ? interaction.member.nickname : interaction.user.username;
        }
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
        interaction.editReply({content: reserve.message, ephemeral: true});
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