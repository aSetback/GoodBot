const ytdl = require('ytdl-core');

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

    // Add song to queue
    let songInfo = await ytdl.getInfo(song);
    let songLength = Math.floor(songInfo.length_seconds / 60) + ':' + songInfo.length_seconds % 60

    let songData = {
        url: song,
        title: songInfo.title,
        songLength: songLength,
        message: message
    };

    if (client.queue[message.guild.id].playing) {
        client.queue[message.guild.id].queue.push(songData);
        message.channel.send("Song added to queue: **" + songInfo.title + "** (" + songLength + ").");
    } else {
        client.music.play(songData, client.queue[message.guild.id], client);
        message.channel.send("Now playing: **" + songInfo.title + "** (" + songLength + ").");
    }

};
