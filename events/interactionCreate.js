const { Message } = require("discord.js");

module.exports = async (client, interaction) => {
    if (interaction.isButton()) {
        let signUp = 'unknown';
        if (interaction.customId == '+') { signUp = 'yes'; }
        if (interaction.customId == '-') { signUp = 'no'; }
        if (interaction.customId == 'm') { signUp = 'maybe'; }
        let reply = '<@' + interaction.user.id + '> has been set to ' + signUp + '.';
        await client.signups.set(interaction.customId, interaction.member.displayName, interaction.channel.name, interaction.message, client);
        interaction.reply({content: reply, ephemeral: true }).catch((e) => {
            console.error('interaction response failed.');
        });
    }
    
    if (interaction.isCommand()) {
        if (interaction.commandName == 'wav') {
            let wav = interaction.options.getString('wav');
            interaction.reply({content: 'Wav Command: ' + wav, ephemeral: true});
            const cmd = client.commands.get('wav');
            cmd.run(client, interaction, [wav]);
        }        
    }
};
