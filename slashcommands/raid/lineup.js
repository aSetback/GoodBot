const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('lineup')
    .setDescription('Get a link to the lineup on the website.');

exports.data = commandData;

exports.run = async (client, interaction) => {
    let raid = await client.raid.get(client, interaction.channel);
    if (!raid) {
        return interaction.reply({content: "This is not a valid raid channel.", ephemeral: true, components: []});
    }
    return interaction.reply({content: 'http://goodbot.me/raids/lineup/' + raid.id , ephemeral: true, components: []});
}
