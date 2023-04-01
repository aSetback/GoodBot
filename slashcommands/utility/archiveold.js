const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('archiveold')
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
        interaction.reply({content: 'Archives has been renamed to Archive-Old -- a new Archives category has been created.', ephemeral: true});
    } else {
        let errorArchiveNoChannel = client.loc('errorMaxChannel', "The category **Archives** does not exist, please create the category to use this command.");
        client.messages.errorMessage(interaction.channel, errorArchiveNoChannel, 240);
    }
}
