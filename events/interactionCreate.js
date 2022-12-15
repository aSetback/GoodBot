module.exports = async (client, interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId.indexOf('sc-button-') > -1) {
            let cmdData = interaction.customId.replace('sc-button-', '').toLowerCase();
            cmdData = cmdData.split('-');
            let slashcmd = cmdData.shift();
            client.log.write(client, interaction.member, interaction.channel, 'Button Press: ' + slashcmd);
            let cmd = client.slashCommands.get(slashcmd);
            cmd.buttonResponse(client, interaction, cmdData);
        } else {
            let raid = await client.raid.get(client, interaction.channel);
            let signup = await client.signups.set(client, raid, interaction.member.displayName, interaction.customId, interaction);
            if (signup.result < 0) {
                return interaction.reply({content: signup.msg, ephemeral: true});
            }
            client.log.write(client, interaction.member, interaction.channel, 'Signup: ' + interaction.customId);
            client.signups.signupReply(client, interaction);
        }
    }

    if (interaction.isModalSubmit()) {
        client.log.write(client, interaction.member, interaction.channel, 'Modal Submit: ' + interaction.customId);
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
        client.log.write(client, interaction.member, interaction.channel, 'Select Menu Used: ' + interaction.customId);
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
