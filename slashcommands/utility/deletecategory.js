const { SlashCommandBuilder } = require('@discordjs/builders');

let commandData = new SlashCommandBuilder()
    .setName('deletecategory')
    .setDescription('Delete a category full of channels.  Be careful!')
    .addStringOption(option =>
		option
            .setName('category')
			.setDescription('Channel Category')
			.setRequired(true)
    );

exports.data = commandData;

exports.run = async (client, interaction) => {

    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
        return false;
    }
    
    let categoryName = interaction.options.getString('category');

    let category = interaction.guild.channels.cache.find(c => c.name == categoryName && c.type == "GUILD_CATEGORY");
    if (!category) {
        let errorDeleteCategoryNotFound = client.loc('errorDeleteCategoryNotFound', "The category **" + categoryName + "** could not be found.");
        return interaction.reply({ content: errorDeleteCategoryNotFound, ephemeral: true });
    }

    let channels = interaction.guild.channels.cache.filter(c => c.parentID == category.id);
    channels.forEach(async (channel) => { 
        await channel.delete();
    });
    category.delete();
    return interaction.reply({ content: "Category has been deleted.", ephemeral: true });
}
