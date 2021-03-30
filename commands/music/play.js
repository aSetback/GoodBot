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

    if (!message.member.voice.channel) {
        return message.channel.send('You must be in a voice channel to listen to music.');
    }

    let song = args[0];

    // Add song to queue
    let songInfo = await ytdl.getInfo(song);
    let details = songInfo.videoDetails;
    let songLength = Math.floor(details.lengthSeconds / 60) + ':' + details.lengthSeconds % 60

    let songData = {
        url: song,
        title: details.title,
        songLength: songLength,
        message: message
    };

    if (client.queue[message.guild.id].playing) {
        client.queue[message.guild.id].queue.push(songData);
        message.channel.send("Song added to queue: **" + songData.title + "** (" + songLength + ")");
    } else {
        client.music.play(songData, client.queue[message.guild.id], client);
        message.channel.send("Now playing: **" + songData.title + "** (" + songLength + ")");
    }

};
