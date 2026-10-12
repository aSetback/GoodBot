const { test } = require('node:test');
const assert = require('node:assert/strict');
const character = require('../functions/character');
const general = require('../functions/general');

// Minimal in-memory stand-in for the sequelize character model.
function fakeClient(rows) {
    let nextID = Math.max(0, ...rows.map(r => r.id)) + 1;
    const matches = (row, where) => Object.entries(where).every(([key, value]) => (row[key] ?? null) == value);
    const wrap = (row) => Object.assign({ set(values) { return Object.assign(this, values); } }, row);
    const model = {
        rows,
        async findOne({ where, order }) {
            let found = rows.filter(row => matches(row, where));
            if (order) {
                found.sort((a, b) => b.id - a.id);
            }
            return found.length ? wrap(found[0]) : null;
        },
        async findAll({ where }) {
            return rows.filter(row => matches(row, where)).map(wrap);
        },
        async create(values) {
            let row = Object.assign({ id: nextID++, mainID: null }, values);
            rows.push(row);
            return wrap(row);
        },
        async update(values, { where }) {
            rows.filter(row => matches(row, where)).forEach(row => Object.assign(row, values));
        }
    };
    return { models: { character: model }, character, general };
}

function fakeMember(id, displayName, username = 'user' + id) {
    return { id, displayName, user: { username }, guild: { id: 1 } };
}

test('getForMember prefers a character named after the member', async () => {
    const client = fakeClient([
        { id: 1, name: 'Bigtank', guildID: 1, memberID: 99, mainID: null },
        { id: 2, name: 'Healz', guildID: 1, memberID: 5, mainID: null },
    ]);
    const result = await character.getForMember(client, fakeMember(5, 'bigtank'));
    assert.equal(result.name, 'Bigtank');
});

test('getForMember falls back to the member\'s most recent main by Discord ID', async () => {
    const client = fakeClient([
        { id: 1, name: 'Oldmain', guildID: 1, memberID: 5, mainID: null },
        { id: 2, name: 'Newmain', guildID: 1, memberID: 5, mainID: null },
        { id: 3, name: 'Somealt', guildID: 1, memberID: 5, mainID: 2 },
        { id: 4, name: 'Othermain', guildID: 2, memberID: 5, mainID: null },
    ]);
    const result = await character.getForMember(client, fakeMember(5, 'Nickname Not Set'));
    assert.equal(result.name, 'Newmain');
});

test('getMainForMember resolves an alt-named member to the main', async () => {
    const client = fakeClient([
        { id: 1, name: 'Main', guildID: 1, memberID: 5, mainID: null },
        { id: 2, name: 'Alty', guildID: 1, memberID: 5, mainID: 1 },
    ]);
    const result = await character.getMainForMember(client, fakeMember(5, 'Alty'));
    assert.equal(result.name, 'Main');
});

test('getMainForMember returns null when the member has no characters', async () => {
    const client = fakeClient([{ id: 1, name: 'Main', guildID: 1, memberID: 7, mainID: null }]);
    assert.equal(await character.getMainForMember(client, fakeMember(5, 'Nobody')), null);
});

test('claim creates a character owned by the member', async () => {
    const client = fakeClient([]);
    const result = await character.claim(client, fakeMember(5, 'x'), 'newalt', { mainID: 3 });
    assert.deepEqual(
        { name: result.name, memberID: result.memberID, mainID: result.mainID, guildID: result.guildID },
        { name: 'Newalt', memberID: 5, mainID: 3, guildID: 1 }
    );
});

test('claim takes ownership of an existing character and keeps its other fields', async () => {
    const client = fakeClient([{ id: 1, name: 'Existing', class: 'mage', guildID: 1, memberID: 99, mainID: null }]);
    await character.claim(client, fakeMember(5, 'x'), 'existing', { mainID: 8 });
    assert.deepEqual(client.models.character.rows[0], { id: 1, name: 'Existing', class: 'mage', guildID: 1, memberID: 5, mainID: 8 });
});
