const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');

module.exports = {
    play: async function(song, guild, client) {
        if (!guild.vc) {
            client.queue[guild.id].vc = song.message.member.voice.channel;
            client.queue[guild.id].conn = await song.message.member.voice.channel.join();
            client.queue[guild.id].conn.voice.setSelfDeaf(true);
        }
    
        client.queue[guild.id].playing = song;
        let dl = ytdl(song.url, {
            quality: 'highestaudio',
            highWaterMark: 1024 * 1024 * 1,
            filter: 'audioonly'
        });

        client.queue[guild.id].dispatcher = client.queue[guild.id].conn.play(dl)
        .on("error", () => {
            client.music.next(guild, client);
        })
        .on("end", () => {
            client.music.next(guild, client);
        });
    },
    next: async function(guild, client) {
        let next = null;
        if (guild.repeat) {
            next = client.queue[guild.id].playing;
        } else {
            next = client.queue[guild.id].queue.shift();
        }

        if (!next) {
            client.queue[guild.id].vc.leave();
            client.queue[guild.id].vc = null;
            client.queue[guild.id].playing = null;
        } else {
            client.music.play(next, guild, client);
        }
    } 
}
