const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('archive')
    .setDescription('Archive a raid channel.');

exports.data = commandData;
exports.run = async (client, interaction) => {
	// Check to see if the user has permission to archive this channel
	if (!client.permission.manageChannel(interaction.member, interaction.channel)) {
		return interaction.reply({content: 'You need permission to manage this channel to be able to archive it.', ephemeral: true})
	}

    
    let category = interaction.guild.channels.cache.find(c => c.name == "Archives" && c.type == "GUILD_CATEGORY");
    if (category) {
        let newArchives = category.clone();
        category.setName('Archives-Old');
    } else {
        let errorArchiveNoChannel = client.loc('errorMaxChannel', "The category **Archives** does not exist, please create the category to use this command.");
        client.messages.errorMessage(interaction.channel, errorArchiveNoChannel, 240);
    }
}
