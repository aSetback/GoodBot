exports.run = async function(client, message, args) {
    if (!client.queue[message.guild.id]) {
        return message.channel.send("No song is currently playing.");
    }
    let volume = parseInt(args[0]);
    if (volume < 1 || volume > 200) {
        return message.channel.send("Invalid volume -- please select a value between 1 & 200.");
    }
    client.queue[message.guild.id].dispatcher.setVolume(volume/100);
    return message.channel.send("Volume is now set to **" + volume +"%**.");
};
