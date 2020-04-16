exports.run = async function(client, message, args) {
    if (!client.queue[message.guild.id]) {
        return message.channel.send("No song is currently playing.");
    }
    let volume = args[0];
    client.queue[message.guild.id].dispatcher.setVolume(volume);    
};
