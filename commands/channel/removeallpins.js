exports.run = async (client, message, args) => {

	if (!message.isAdmin) {
		return false;
    }

   message.channel.messages.fetchPinned().then((pinnedMessages) => {
        pinnedMessages.forEach(async (message) => {
            await message.unpin();
        });
    });
};