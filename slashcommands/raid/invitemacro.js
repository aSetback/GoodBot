const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('invitemacro')
    .setDescription('Get an invite macro DM.');
    
exports.data = commandData;

exports.run = async (client, interaction) => {

    // Get our raid information
    let raid = await client.raid.get(client, interaction.channel);
    // Make sure this is actually a raid!
    if (!raid) {
        return interaction.reply({content:'This must be used in a raid channel.', ephemeral: true});
    }

    let list = raid.signups.filter(signup => signup.confirmed == 1);
    let players = [];
    list.forEach((signup) => {
            players.push('"' + signup.player + '"');
            if (players.length > 10) {
                let playerString = players.join(", ");
                let macroString = "```lua\n/run for key, member in pairs({" + playerString + "}) do InviteUnit(member) end```"
                interaction.member.send(macroString);
                players = [];
            }
    });
    if (players.length) {
        let playerString = players.join(", ");
        let macroString = "```lua\n/run for key, member in pairs({" + playerString + "}) do InviteUnit(member) end```"
        interaction.member.send(macroString);
    }
    return interaction.reply({content:'Invite macros sent.', ephemeral: true});
}