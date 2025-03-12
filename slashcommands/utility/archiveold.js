const { PermissionsBitField } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('archiveold')
    .setDescription('Archive a raid channel.');

exports.data = commandData;
exports.run = async (client, interaction) => {
    let permissions = interaction.channel.permissionsFor(interaction.user);
    if (!permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return interaction.reply({ephemeral: true, content: client.loc('crosspostNoPermission', "You do not have the correct permissions.")});
    }

    let category = interaction.guild.channels.cache.find(c => c.name == "Archives" && c.type == 4);
    if (category) {
        category.clone();
        category.setName('Archives-Old');
        return interaction.reply({content: 'Archives has been renamed to Archive-Old -- a new Archives category has been created.', ephemeral: true});
    } else {
        return interaction.reply({content: 'The category **Archives** does not exist, please create the category to use this command.', ephemeral: true});
    }
}
