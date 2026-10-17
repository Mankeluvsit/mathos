import { requireNode, python, run } from './dev-tools.mjs';

requireNode();
const args = process.argv.slice(2);
if (args.length > 1 || args.some((arg) => arg !== '--core')) throw Error('Usage: node scripts/verify.mjs [--core]');
const py = python();
run(py.command, [...py.prefix, 'scripts/reference-fixtures.py', '--check']);
run(py.command, [...py.prefix, 'scripts/life-reference.py', '--check']);
run(py.command, [...py.prefix, 'scripts/learning-reference.py', '--check']);
run(process.execPath, ['scripts/ecology-fixtures.mjs']);
run(process.execPath, ['scripts/oriented-fixtures.mjs']);
run(process.execPath, ['scripts/learning-fixtures.mjs']);
run('npm', ['run', 'check']);
if (!args.length) run('npm', ['run', 'test:browser']);
console.log(args.length ? 'Core verification passed. Browser checks were NOT run.' : 'Full verification passed: references, lint, types, tests, build, Chromium and Firefox.');
