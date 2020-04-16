const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const youtubeAPI = require('../google.json');
const youtube = new Youtube(youtubeAPI.private_key);

module.exports = {
    play: async function(song, guild, client) {
        client.queue[guild.id].playing = song;
        let dl = ytdl(song, {
            quality: 'highestaudio',
            highWaterMark: 1024 * 1024 * 10,
            filter: 'audioonly'
        });
        client.queue[guild.id].dispatcher = guild.conn.playStream(dl)
        .on("error", () => {
            client.music.next(guild, client)
        })
        .on("finish", () => {
            client.music.next(guild, client)
        });
    },
    next: async function(guild, client) {
        if (guild.queue.length) {
            let next = guild.queue.shift();
            client.music.play(next, guild, client);
        } else {
            client.queue[guild.id].playing = null;
            return guild.vc.leave();
        }
    } 
}

