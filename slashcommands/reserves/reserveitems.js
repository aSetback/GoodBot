const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('reserveitems')
    .setDescription('List items eligible for reserve in this raid.');

exports.data = commandData;

exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    let raid = await client.raid.get(client, interaction.channel);
    if (!raid) {
        return interaction.editReply({ content: 'This command is only usable in raid channels.' });
    }

    let items = await client.reserves.likeSearch(client, raid, '');
    items.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    if (!items.length) {
        return interaction.editReply({ content: 'No reservable items have been set up for **' + raid.raid.toUpperCase() + '** yet.' });
    }

    let icon = 'https://goodbot.me/images/icons/' + raid.raid.toLowerCase().replace(/\s/g, "") + '.png';

    let buildEmbed = () => new Discord.EmbedBuilder()
        .setTitle('Reservable items for ' + raid.raid.toUpperCase())
        .setColor(0xb00b00)
        .setThumbnail(icon);

    let embeds = [];
    let embed = buildEmbed();
    let fieldValue = '';
    let fieldCount = 0;

    items.forEach(item => {
        let line = '[' + item.name + '](https://tbc.wowhead.com/item=' + item.itemID + ')\n';
        if (fieldValue.length + line.length > 1000) {
            embed.addFields({ name: 'Reservable Items', value: fieldValue });
            fieldValue = '';
            fieldCount++;
            if (fieldCount == 5) {
                embeds.push(embed);
                embed = buildEmbed();
                fieldCount = 0;
            }
        }
        fieldValue += line;
    });
    if (fieldValue.length) {
        embed.addFields({ name: 'Reservable Items', value: fieldValue });
    }
    embeds.push(embed);

    for (let index = 0; index < embeds.length; index++) {
        if (index == 0) {
            await interaction.editReply({ embeds: [embeds[index]] });
        } else {
            await interaction.followUp({ embeds: [embeds[index]], ephemeral: true });
        }
    }
}
