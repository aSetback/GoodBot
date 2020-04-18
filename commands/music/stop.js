exports.run = async function(client, message, args) {
    let guild = client.queue[message.guild.id];
    if (!guild) {
        return message.channel.send('There is currently no songs in the queue.');
    }
    guild.queue = [];
    guild.dispatcher.end();
    client.queue[message.guild.id] = guild;
};
