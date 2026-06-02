const fetch = require('node-fetch');
const { AttachmentBuilder } = require('discord.js');
const path = require('path');

const TORKELSON_ID = 679529;
const TIGERS_TEAM_ID = 116;
const GUILD_ID = '1170163780890673232';
const CHANNEL_ID = '1338908982651129916';
const IMAGE_PATH = path.join(__dirname, '..', 'assets', 'tork.png');
const POLL_INTERVAL_MS = 30_000;

const announcedPlayIds = new Set();
let currentGamePk = null;

async function getTodaysGame() {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Detroit' });
    const res = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}&teamId=${TIGERS_TEAM_ID}`);
    const data = await res.json();
    if (!data.dates?.length || !data.dates[0].games?.length) return null;
    return data.dates[0].games[0];
}

async function checkForHomers(client) {
    try {
        const game = await getTodaysGame();
        if (!game || game.status.abstractGameState !== 'Live') return;

        const { gamePk } = game;
        if (gamePk !== currentGamePk) {
            currentGamePk = gamePk;
            announcedPlayIds.clear();
        }

        const res = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`);
        const data = await res.json();
        const allPlays = data.liveData?.plays?.allPlays || [];

        for (const play of allPlays) {
            if (play.matchup?.batter?.id !== TORKELSON_ID) continue;
            if (play.result?.eventType !== 'home_run') continue;

            const playId = play.about?.atBatIndex;
            if (playId == null || announcedPlayIds.has(playId)) continue;
            announcedPlayIds.add(playId);

            await postHomeRunAnnouncement(client);
        }
    } catch (err) {
        console.error('[watch] MLB check error:', err.message);
    }
}

async function postHomeRunAnnouncement(client) {
    try {
        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) return console.error('[watch] Guild not found');
        const channel = guild.channels.cache.get(CHANNEL_ID);
        if (!channel) return console.error('[watch] Channel not found');

        await channel.send({ files: [new AttachmentBuilder(IMAGE_PATH)] });
        console.log('[watch] Tork homer posted');
    } catch (err) {
        console.error('[watch] Post error:', err.message);
    }
}

module.exports = {
    run: (client) => {
        setInterval(() => checkForHomers(client), POLL_INTERVAL_MS);
        checkForHomers(client);
        console.log('[watch] Torkelson HR watcher started');
    }
};
