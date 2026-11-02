// Re-capitalize stored character names with general.ucfirst, which now capitalizes every word.
//
// WoW Forever characters have first and last names ("Timmy Tuffknuckles"), but ucfirst used to
// lowercase everything after the first letter, so they were saved as "Timmy tuffknuckles".  This
// fixes the names already in the database:
//   characters.name, signups.player, wow_officers.name, wow_guild_masters.name
//
// Characters whose fixed name would collide with another character in the same guild (e.g. both
// "Timmy tuffknuckles" and "Timmy Tuffknuckles" exist) are reported and left alone.
//
// Nothing is written unless --apply is passed; --apply backs up the old values to new tables first.
//
// Usage: node scripts/fix-name-capitalization.js [--guild <id>] [--apply]

const mariadb = require('mariadb');
const config = require('../config.json');
const { ucfirst } = require('../functions/general');

const args = process.argv.slice(2);
const argValue = (flag) => { let i = args.indexOf(flag); return i > -1 ? args[i + 1] : null; };
const onlyGuild = argValue('--guild');
const apply = args.includes('--apply');

const targets = [
    { table: 'characters', column: 'name' },
    { table: 'signups', column: 'player' },
    { table: 'wow_officers', column: 'name' },
    { table: 'wow_guild_masters', column: 'name' },
];

(async () => {
    let db = await mariadb.createConnection({
        host: config.db.ip, user: config.db.user, password: config.db.pass, database: config.db.name,
        bigIntAsNumber: false, supportBigNumbers: true, bigNumberStrings: true,
    });
    try {
        let plan = [];
        for (let { table, column } of targets) {
            let rows = await db.query(
                `SELECT id, guildID, \`${column}\` AS value FROM ${table}` + (onlyGuild ? ' WHERE guildID = ?' : ''),
                onlyGuild ? [onlyGuild] : []
            );
            let changes = rows
                .filter(row => row.value && ucfirst(row.value) !== row.value)
                .map(row => ({ id: row.id, guildID: String(row.guildID), from: row.value, to: ucfirst(row.value) }));

            let skipped = [];
            if (table == 'characters') {
                // Exact (case-sensitive) names per guild, so we can spot names that differ only by case.
                let existing = new Map();
                rows.forEach(row => {
                    let key = row.guildID + ':' + String(row.value).toLowerCase();
                    if (!existing.has(key)) existing.set(key, []);
                    existing.get(key).push(row);
                });
                changes = changes.filter(change => {
                    let others = existing.get(change.guildID + ':' + change.to.toLowerCase()).filter(row => row.id != change.id);
                    if (others.length) {
                        skipped.push(change);
                        return false;
                    }
                    return true;
                });
            }

            console.log(`\n${table}.${column}: ${changes.length} to update` + (skipped.length ? `, ${skipped.length} skipped (duplicate character in guild)` : ''));
            changes.slice(0, 50).forEach(c => console.log(`  [${c.id}] guild ${c.guildID}: "${c.from}" -> "${c.to}"`));
            if (changes.length > 50) console.log(`  ... and ${changes.length - 50} more`);
            skipped.forEach(c => console.log(`  SKIPPED [${c.id}] guild ${c.guildID}: "${c.from}" (another character already uses "${c.to}")`));
            plan.push({ table, column, changes });
        }

        let total = plan.reduce((n, p) => n + p.changes.length, 0);
        if (!apply) {
            console.log(`\nDry run - ${total} rows would be updated.  Re-run with --apply to write them.`);
            return;
        }

        let stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
        for (let { table, column, changes } of plan) {
            if (!changes.length) continue;
            let backup = `${table}_name_backup_${stamp}`;
            await db.query(`CREATE TABLE ${backup} AS SELECT id, \`${column}\` FROM ${table} WHERE id IN (?)`, [changes.map(c => c.id)]);
            console.log(`Backed up ${changes.length} ${table} rows to ${backup}`);
        }
        await db.beginTransaction();
        for (let { table, column, changes } of plan) {
            for (let change of changes) {
                await db.query(`UPDATE ${table} SET \`${column}\` = ? WHERE id = ?`, [change.to, change.id]);
            }
        }
        await db.commit();
        console.log(`Updated ${total} rows.`);
    } finally {
        await db.end();
    }
})().catch(e => {
    console.error(e);
    process.exit(1);
});
