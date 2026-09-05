const { test } = require('node:test');
const assert = require('node:assert/strict');
const permission = require('../functions/permission');

test('isSuperAdmin is true only for ids listed in config.validAdmins', () => {
    const client = { config: { validAdmins: { owner: '111', backup: '222' } } };
    assert.equal(permission.isSuperAdmin(client, { id: '111' }), true);
    assert.equal(permission.isSuperAdmin(client, { id: '999' }), false);
});

test('manageChannel is false for DM channels regardless of permissions', () => {
    const channel = { type: 'dm', permissionsFor: () => ({ has: () => true }) };
    assert.equal(permission.manageChannel({}, channel), false);
});

test('manageChannel reflects whether the member can manage the channel', () => {
    const allowed = { type: 'text', permissionsFor: () => ({ has: () => true }) };
    const denied = { type: 'text', permissionsFor: () => ({ has: () => false }) };
    assert.equal(permission.manageChannel({}, allowed), true);
    assert.equal(permission.manageChannel({}, denied), false);
});
