const { SlashCommandBuilder } = require('@discordjs/builders');
const moment = require('moment');


let commandData = new SlashCommandBuilder()
    .setName('reservelog')
    .setDescription('View a log of all reserves made for this raid.');

exports.data = commandData;

exports.run = async (client, interaction) => {
    let raid = await client.raid.get(client, interaction.channel);
    let logs = await client.models.reserveLog.findAll({where: {raidID: raid.id}});
    let reply = "```md\n"
    reply += "User ID".padEnd(20);
    reply += "Log".padEnd(100);
    reply += "Timestamp".padEnd(20);
    reply += '\n';
    reply += "".padEnd(140, "-");
    reply += '\n';
    logs.forEach((log) => {
        reply += log.memberID.padEnd(20);
        reply += log.log.padEnd(100);
        reply += moment(new Date(log.createdAt)).format('h:mm A, L');
        reply += '\n';
    });
    reply += '```';
    return interaction.reply({ephemeral: true, content: reply});
}
