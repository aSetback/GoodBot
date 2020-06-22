exports.run = async (client, message, args) => {

	if (!message.isAdmin) {
		return false;
    }

   message.channel.fetchPinnedMessages().then((pinnedMessages) => {
        pinnedMessages.forEach(async (message) => {
            await message.unpin();
        });
    });
};