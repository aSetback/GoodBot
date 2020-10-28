exports.run = async (client, message, args) => {

	if (!message.isAdmin) {
		return false;
    }

   message.channel.messages.fetchPinnedMessages().then((pinnedMessages) => {
        pinnedMessages.forEach(async (message) => {
            await message.unpin();
        });
    });
};