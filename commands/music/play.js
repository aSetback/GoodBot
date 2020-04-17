exports.run = async function(client, message, args) {
    if (!client.queue[message.guild.id]) {
        client.queue[message.guild.id] = {
            id: message.guild.id,
            queue: [],
            playing: false,
            conn: null,
            vc: null,
            repeat: false
        }
    }

    let song = args[0];
    client.queue[message.guild.id].vc = message.member.voiceChannel;
    client.queue[message.guild.id].conn = await client.queue[message.guild.id].vc.join();

    // Add song to queue
    if (client.queue[message.guild.id].playing) {
        client.queue[message.guild.id].queue.push(song);
        return message.channel.send("Song added to queue.");
    }

    client.music.play(song, client.queue[message.guild.id], client);
};
