const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'test']);

function collectJsFiles(dir) {
    let files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (SKIP_DIRS.has(entry.name)) continue;
            files = files.concat(collectJsFiles(path.join(dir, entry.name)));
        } else if (entry.name.endsWith('.js')) {
            files.push(path.join(dir, entry.name));
        }
    }
    return files;
}

// A parse-only check (no execution, no Discord/DB side effects) that every
// command/event/function file is at least valid JavaScript. Catches typos
// and copy-paste mistakes that would otherwise only surface when a specific
// command is invoked in production.
for (const file of collectJsFiles(ROOT)) {
    const relative = path.relative(ROOT, file);
    test(`${relative} has valid syntax`, () => {
        const source = fs.readFileSync(file, 'utf8');
        assert.doesNotThrow(() => new vm.Script(source, { filename: relative }));
    });
}
