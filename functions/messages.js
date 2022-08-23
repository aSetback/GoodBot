module.exports = {
    errorMessage: (channel, message, seconds) => {
        channel.send(message).then((sentMessage) => {
            setTimeout(() => {
                sentMessage.delete().catch(O_o => { });
            }, seconds * 1000);
        });
        let errorChannel = channel.guild ? channel.guild.channels.cache.find(c => c.name == "error-logs") : null;
        if (errorChannel) {
            errorChannel.send(`${channel}` + ': ' + message);
        }
    },
    send: (channel, message, seconds) => {
        channel.send(message).then((sentMessage) => {
            setTimeout(() => {
                sentMessage.delete().catch(O_o => { });
            }, seconds * 1000);
        });
    },
    handle: async (client, message) => {
      
    }
}