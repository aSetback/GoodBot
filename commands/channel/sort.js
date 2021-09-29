exports.run = async (client, message, args) => {
    // Verify that the person running this command should be allowed to.
	if (!client.permission.manageChannel(message.member, message.channel)) {
		return message.channel.send('You need permission to manage this channel to be able to re-order it.')
    }
    // Grab Category from channel
    let category = message.channel.parent;
    
    // Get the list of channels within this category
    let channelList = category.children;
    
    // Create an array to use for sorting our channels
    sortingArray = [];
    for (channel of channelList) {
        // Retrieve the raid information
        let raid = await client.raid.get(client, channel[1]);
    
        // If raid information exists, push the info to the sortingArray
        if (raid) {
            sortingArray.push([raid.channelID, raid.date]);
        }
    }

    // Sort our channels by date
    sortingArray.sort((a, b) => {
        if (a[1] > b[1]) { return 1; }
        if (a[1] == b[1]) { return 0; }
        return -1;
    });

    // Loop through our sorted array
    for (key in sortingArray) {
        // Grab the channel ID (first element in the channel array)
        let channel = sortingArray[key];
        // Retrieve the discord channel from the cache
        channel = message.guild.channels.cache.find(c => c.id == channel[0]);
        // Set the channel position -- await is critical here!
        await channel.setPosition(key);
    }
}