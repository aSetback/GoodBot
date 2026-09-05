const { test } = require('node:test');
const assert = require('node:assert/strict');
const general = require('../functions/general');

test('ucfirst capitalizes the first letter and lowercases the rest', () => {
    assert.equal(general.ucfirst('daryanna'), 'Daryanna');
    assert.equal(general.ucfirst('DARYANNA'), 'Daryanna');
    assert.equal(general.ucfirst(''), '');
});

test('parseTime parses 12-hour clock strings into HH:MM:00', () => {
    assert.equal(general.parseTime('7:30pm'), '19:30:00');
    assert.equal(general.parseTime('7:30 PM'), '19:30:00');
    assert.equal(general.parseTime('9:00am'), '9:00:00');
});

test('parseTime returns false when it cannot parse the input', () => {
    assert.equal(general.parseTime('not a time'), false);
});

test('parseList splits args on spaces/commas and preserves quoted groups', () => {
    assert.deepEqual(general.parseList(['tank,', 'healer', '"off', 'tank"']), ['tank', 'healer', 'off tank']);
});
