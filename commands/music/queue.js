exports.run = async function(client, message, args) {
    if (!client.queue[message.guild.id] || !client.queue[message.guild.id].queue.length) {
        return message.channel.send('There is currently no songs in the queue.');
    }

    queueMessage = '__**Current Queue**__\n';
    for (key in client.queue[message.guild.id].queue) {
        let song = client.queue[message.guild.id].queue[key];
        queueMessage += (key + 1) + '> ' + song + '\n';
    }
    return message.channel.send(queueMessage);
};
