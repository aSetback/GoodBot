const { test } = require('node:test');
const assert = require('node:assert/strict');
const pkg = require('../package.json');

// Regression guard: mariadb 3.5.x and enmap 6.x ship as ESM-only packages,
// which crash this CommonJS codebase's require() calls at startup (see
// commits 15419bf and 9e1e51d). `npm install` alone won't catch that until
// the process actually boots, so assert every direct dependency is
// require()-able here first.
for (const name of Object.keys(pkg.dependencies)) {
    test(`dependency "${name}" is require()-able (not ESM-only)`, () => {
        assert.doesNotThrow(() => require(name));
    });
}
