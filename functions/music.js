const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const youtubeAPI = require('../google.json');
const youtube = new Youtube(youtubeAPI.private_key);

module.exports = {
    play: async function(song, guild, client) {
        if (!guild.vc) {
            client.queue[guild.id].vc = song.message.member.voiceChannel;
            client.queue[guild.id].conn = await song.message.member.voiceChannel.join();
        }
    
        client.queue[guild.id].playing = song;
        let dl = ytdl(song.url, {
            quality: 'highestaudio',
            highWaterMark: 1024 * 1024 * 1,
            filter: 'audioonly'
        });
        client.queue[guild.id].dispatcher = guild.conn.playStream(dl)
        .on("error", () => {
            client.music.next(guild, client)
        })
        .on("end", () => {
            let next = null;
            if (guild.repeat) {
                next = guild.playing;
            } else {
                next = guild.queue.shift();
            }
            if (!next) {
                guild.vc.leave();
                guild.vc = null;
                guild.playing = null;
            } else {
                client.music.play(next, guild, client);
            }
        });
    },
    next: async function(guild) {
        guild.dispatcher.end();
    } 
}
