const { Message } = require("discord.js");

module.exports = async (client, interaction) => {
    if (interaction.isButton()) {
        let raid = await client.raid.get(client, interaction.channel);
        await client.signups.set(client, raid, interaction.member.displayName, interaction.customId, interaction.member.id);
        client.signups.signupReply(client, interaction);
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId == 'altModal') {
            await client.signups.createAlt(client, interaction);
        }
        if (interaction.customId.indexOf('sc-modal-') > -1) {
            let slashcmd = interaction.customId.replace('sc-modal-', '').toLowerCase();
            let cmd = client.slashCommands.get(slashcmd);
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
        } else {
            if (interaction.customId.indexOf('sc-select-') > -1) {
                let cmdData = interaction.customId.replace('sc-select-', '').toLowerCase();
                cmdData = cmdData.split('-');
                let slashcmd = cmdData.shift();
                let cmd = client.slashCommands.get(slashcmd);
                cmd.selectResponse(client, interaction, cmdData);
            }
        }
    }

    if (interaction.isCommand()) {
        client.log.write(client, interaction.member, interaction.channel, 'Slash Command: ' + interaction.commandName);

        const cmd = client.slashCommands.get(interaction.commandName);
        cmd.run(client, interaction);
    }
};
