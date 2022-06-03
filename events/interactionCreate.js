const { Message } = require("discord.js");

module.exports = async (client, interaction) => {
    if (interaction.isButton()) {
        let signUp = 'unknown';
        if (interaction.customId == '+') { signUp = 'yes'; }
        if (interaction.customId == '-') { signUp = 'no'; }
        if (interaction.customId == 'm') { signUp = 'maybe'; }
        if (signUp == 'unknown') {
            if (interaction.customId == 'alt') {
            }
        } else {
            await client.signups.set(interaction.customId, interaction.member.displayName, interaction.channel.name, interaction.message, client);
            client.signups.signupReply(client, interaction);
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId == 'altModal') {
            await client.signups.createAlt(client, interaction);
        }
        if (interaction.customId.indexOf('sc-modal-') > -1) {
            let slashcmd = interaction.customId.replace('sc-modal-', '').toLowerCase();
            let cmd = client.slashcommands.get(slashcmd);
            cmd.modalResponse(client, interaction);
        }
    }
    
    if (interaction.isSelectMenu()) {
        if (interaction.customId == 'altSelect') {
            if (interaction.values[0] == 'new') {
                client.signups.altModal(client, interaction);
            } else {
                client.signups.selectAlt(client, interaction);
            }
        }
    }

    if (interaction.isCommand()) {
        client.log.write(client, interaction.member, interaction.channel, 'Slash Command: ' + interaction.commandName);

        const cmd = client.slashcommands.get(interaction.commandName);
        cmd.run(client, interaction);
    }
};
