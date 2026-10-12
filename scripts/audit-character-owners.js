// Audit (and optionally fix) characters.memberID so it holds the Discord ID of the character's owner.
//
// Before this was tracked properly, /set overwrote memberID with whoever last edited a character, so
// older rows may point at an officer instead of the player.  For each character this gathers:
//   - name:    guild members whose nickname (or display/user name) matches the character's name
//   - signups: which Discord users have signed this character up for raids
//   - main:    for alts, the owner worked out for their main
// and proposes an owner.  Nothing is written unless --apply is passed; --apply backs up the current
// values to a new table first.
//
// Name matching lists each guild's members, which needs the Server Members intent; without it the
// script falls back to one rate-limited search per character, which is very slow on large guilds.
// --no-discord skips name matching entirely and uses only signup and main evidence.
//
// Usage: node scripts/audit-character-owners.js [--guild <id>] [--out <file.csv>] [--no-discord] [--apply]

const fs = require('fs');
const path = require('path');
const mariadb = require('mariadb');
const fetch = require('node-fetch');
const config = require('../config.json');

const args = process.argv.slice(2);
const argValue = (flag) => { let i = args.indexOf(flag); return i > -1 ? args[i + 1] : null; };
const onlyGuild = argValue('--guild');
const outFile = argValue('--out') || 'character-owners.csv';
const apply = args.includes('--apply');
const noDiscord = args.includes('--no-discord');

// Signup evidence counts only when one user made at least this many, and this share, of a character's signups.
const SIGNUP_MIN = 2;
const SIGNUP_SHARE = 0.75;
// Signups made by someone who signed up this many different players in a guild (raid leaders), or by the bot
// itself (website/API signups), say nothing about ownership and are ignored.
const BULK_SIGNER = 3;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function discord(route) {
    for (;;) {
        let res = await fetch('https://discord.com/api/v10' + route, { headers: { Authorization: 'Bot ' + config.token } });
        if (res.status == 429) {
            let body = await res.json();
            await sleep((body.retry_after || 1) * 1000 + 100);
            continue;
        }
        if (!res.ok) {
            let error = new Error(`Discord ${res.status} for ${route}`);
            error.status = res.status;
            throw error;
        }
        return res.json();
    }
}

// name (lowercase) -> Set of user IDs, built from nickname first and user/global names second.
function indexMembers(members) {
    let byNick = new Map(), byName = new Map();
    let add = (map, name, id) => {
        if (!name) return;
        name = name.toLowerCase();
        if (!map.has(name)) map.set(name, new Set());
        map.get(name).add(id);
    };
    members.forEach(member => {
        add(byNick, member.nick, member.user.id);
        add(byName, member.user.global_name, member.user.id);
        add(byName, member.user.username, member.user.id);
    });
    return { byNick, byName };
}

async function guildMemberIndex(guildID, names) {
    let members = [];
    try {
        let after = '0';
        for (;;) {
            let page = await discord(`/guilds/${guildID}/members?limit=1000&after=${after}`);
            members.push(...page);
            if (page.length < 1000) break;
            after = page[page.length - 1].user.id;
        }
    } catch (e) {
        if (e.status == 404) {
            return null; // bot is no longer in this guild
        }
        if (e.status != 403) throw e;
        // Listing needs the Server Members intent - search for each character name instead.
        members = [];
        for (let name of names) {
            members.push(...await discord(`/guilds/${guildID}/members/search?limit=10&query=${encodeURIComponent(name)}`));
        }
    }
    return indexMembers(members);
}

function nameMatch(index, name) {
    if (!index) return null;
    name = name.toLowerCase();
    let ids = index.byNick.get(name) || index.byName.get(name);
    return ids && ids.size == 1 ? [...ids][0] : null;
}

function signupOwner(counts) {
    if (!counts || !counts.size) return null;
    let total = 0, top = null;
    for (let [memberID, n] of counts) {
        total += n;
        if (!top || n > top[1]) top = [memberID, n];
    }
    return top[1] >= SIGNUP_MIN && top[1] / total >= SIGNUP_SHARE ? top[0] : null;
}

function csvRow(values) {
    return values.map(v => {
        v = v == null ? '' : String(v);
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    }).join(',');
}

(async () => {
    let db = await mariadb.createConnection({
        host: config.db.ip, user: config.db.user, password: config.db.pass, database: config.db.name,
        bigNumberStrings: true, supportBigNumbers: true
    });

    try {
        let characters = await db.query(
            'SELECT id, name, guildID, memberID, mainID FROM characters' + (onlyGuild ? ' WHERE guildID = ?' : ''),
            onlyGuild ? [onlyGuild] : []
        );
        let signupRows = await db.query(
            'SELECT characterID, LOWER(player) AS player, guildID, memberID, COUNT(*) AS n FROM signups ' +
            'WHERE memberID IS NOT NULL' + (onlyGuild ? ' AND guildID = ?' : '') +
            ' GROUP BY characterID, LOWER(player), guildID, memberID',
            onlyGuild ? [onlyGuild] : []
        );

        let byID = new Map(characters.map(c => [String(c.id), c]));
        let byName = new Map(characters.map(c => [c.guildID + ':' + c.name.toLowerCase(), c]));

        // character id -> Map(memberID -> signup count), matched by characterID or, failing that, by name.
        let signupCounts = new Map();
        signupRows.forEach(row => {
            let character = (row.characterID && byID.get(String(row.characterID))) || byName.get(row.guildID + ':' + row.player);
            if (!character) return;
            let counts = signupCounts.get(character.id) || new Map();
            counts.set(String(row.memberID), (counts.get(String(row.memberID)) || 0) + Number(row.n));
            signupCounts.set(character.id, counts);
        });

        // guild:member -> the players (main character IDs) they've signed up; drop bulk signers' evidence.
        let signedPlayers = new Map();
        characters.forEach(c => {
            let player = c.mainID && byID.has(String(c.mainID)) ? String(c.mainID) : String(c.id);
            for (let memberID of (signupCounts.get(c.id) || new Map()).keys()) {
                let key = c.guildID + ':' + memberID;
                if (!signedPlayers.has(key)) signedPlayers.set(key, new Set());
                signedPlayers.get(key).add(player);
            }
        });
        let bulkSigners = new Set([...signedPlayers].filter(([, players]) => players.size >= BULK_SIGNER).map(([key]) => key));
        let ownerSignups = (c) => {
            let counts = signupCounts.get(c.id);
            if (!counts) return null;
            return new Map([...counts].filter(([memberID]) => memberID != String(config.userId) && !bulkSigners.has(c.guildID + ':' + memberID)));
        };

        // Gather each character's own evidence, one guild at a time.
        let guilds = [...new Set(characters.map(c => c.guildID))];
        let results = new Map();
        for (let [i, guildID] of guilds.entries()) {
            let guildCharacters = characters.filter(c => c.guildID == guildID);
            let index = null;
            if (!noDiscord) {
                process.stderr.write(`Guild ${i + 1}/${guilds.length} (${guildID}): ${guildCharacters.length} characters\n`);
                index = await guildMemberIndex(guildID, guildCharacters.map(c => c.name));
            }
            guildCharacters.forEach(c => results.set(c.id, {
                byName: nameMatch(index, c.name),
                bySignups: signupOwner(ownerSignups(c)),
                inGuild: noDiscord || index != null
            }));
        }

        // Decide owners: mains first, then alts (which can inherit from their main).
        let decide = (c, mainOwner) => {
            let r = results.get(c.id);
            let candidates = [[r.byName, 'name'], [r.bySignups, 'signups'], [mainOwner, 'main']].filter(([id]) => id);
            let distinct = new Set(candidates.map(([id]) => id));
            if (distinct.size > 1) return { owner: null, basis: 'conflict: ' + candidates.map(([id, b]) => b + '=' + id).join(' ') };
            if (distinct.size == 1) return { owner: candidates[0][0], basis: candidates.map(([, b]) => b).join('+') };
            return { owner: null, basis: r.inGuild ? 'no evidence' : 'bot not in guild' };
        };
        let decisions = new Map();
        characters.filter(c => !c.mainID || !byID.has(String(c.mainID))).forEach(c => decisions.set(c.id, decide(c, null)));
        // An alt whose main is itself an alt gets no inherited owner rather than depending on processing order.
        characters.filter(c => !decisions.has(c.id)).forEach(c => decisions.set(c.id, decide(c, (decisions.get(byID.get(String(c.mainID)).id) || {}).owner)));

        // Report
        let lines = [csvRow(['id', 'guildID', 'name', 'main', 'currentMemberID', 'proposedMemberID', 'status', 'basis', 'signupsByMember'])];
        let summary = {};
        let changes = [];
        characters.forEach(c => {
            let d = decisions.get(c.id);
            let status = d.basis.startsWith('conflict') ? 'conflict' : !d.owner ? 'unknown' : d.owner == String(c.memberID) ? 'correct' : 'change';
            summary[status] = (summary[status] || 0) + 1;
            if (status == 'change') changes.push([d.owner, c.id]);
            let counts = signupCounts.get(c.id);
            let main = c.mainID && byID.get(String(c.mainID));
            lines.push(csvRow([c.id, c.guildID, c.name, main ? main.name : '', c.memberID, d.owner, status, d.basis,
                counts ? [...counts].map(([id, n]) => id + ':' + n + (ownerSignups(c).has(id) ? '' : '(ignored)')).join(' ') : '']));
        });
        fs.writeFileSync(outFile, lines.join('\n') + '\n');
        console.log(`Wrote ${path.resolve(outFile)}`);
        console.log(summary);

        if (!apply) {
            console.log(`Dry run - ${changes.length} characters would be updated.  Re-run with --apply to write them.`);
            return;
        }
        let backup = 'character_owner_backup_' + new Date().toISOString().replace(/\D/g, '').slice(0, 14);
        await db.query(`CREATE TABLE ${backup} AS SELECT id, memberID FROM characters`);
        await db.beginTransaction();
        for (let change of changes) {
            await db.query('UPDATE characters SET memberID = ? WHERE id = ?', change);
        }
        await db.commit();
        console.log(`Updated ${changes.length} characters.  Previous values saved in table ${backup}.`);
    } finally {
        await db.end();
    }
})().catch(e => {
    console.error(e);
    process.exit(1);
});
