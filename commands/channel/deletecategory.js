exports.run = async (client, message, args) => {

	if (!message.isAdmin) {
		return false;
    }
    
    let categoryName = args.join(" ");

    let category = message.guild.channels.cache.find(c => c.name == categoryName && c.type == "category");
    if (!category) {
        let errorDeleteCategoryNotFound = client.loc('errorDeleteCategoryNotFound', "The category **" + categoryName + "** could not be found.");
        return client.messages.errorMessage(message.channel, errorDeleteCategoryNotFound, 240);
    }

    let channels = message.guild.channels.cache.filter(c => c.parentID == category.id);
    channels.forEach(async (channel) => { 
        await channel.delete();
    });
    category.delete();
};