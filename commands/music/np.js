exports.run = async function(client, message, args) {
    let guild = client.queue[message.guild.id];
    if (!guild) {
        return message.channel.send("No song is currently playing.");
    }
    let np = client.queue[message.guild.id].playing;
    if (!np) {
        return message.channel.send("No song is currently playing.");
    }
    return message.channel.send('Now playing: **' + np.title + "** (" + np.songLength + ")");
};
