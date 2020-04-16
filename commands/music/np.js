exports.run = async function(client, message, args) {
    if (!client.queue[message.guild.id]) {
        return message.channel.send("No song is currently playing.");
    }
    return message.channel.send('Now playing: ' + client.queue[message.guild.id].playing);
};
