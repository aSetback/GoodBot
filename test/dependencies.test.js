const { test } = require('node:test');
const assert = require('node:assert/strict');
const pkg = require('../package.json');

// Regression guard: mariadb 3.5.x ships as an ESM-only package, which
// crashes this CommonJS codebase's require() calls at startup (see commit
// 15419bf). `npm install` alone won't catch that until the process actually
// boots, so assert every direct dependency is require()-able here first.
for (const name of Object.keys(pkg.dependencies)) {
    test(`dependency "${name}" is require()-able (not ESM-only)`, () => {
        assert.doesNotThrow(() => require(name));
    });
}
