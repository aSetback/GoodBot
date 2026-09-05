const { test } = require('node:test');
const assert = require('node:assert/strict');
const timestamp = require('../functions/timestamp');

test('translate formats a Date as "YYYY-MM-DD HH:MM:SS"', () => {
    const date = new Date(2026, 8, 5, 3, 6, 21); // months are 0-indexed: September
    assert.equal(timestamp.translate(date), '2026-09-05 03:06:21');
});

test('translate zero-pads single-digit month/day/time components', () => {
    const date = new Date(2026, 0, 1, 0, 0, 0); // January 1st, midnight
    assert.equal(timestamp.translate(date), '2026-01-01 00:00:00');
});
