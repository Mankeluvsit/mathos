import { requireNode, python, run } from './dev-tools.mjs';

requireNode();
python();
const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--with-deps') || args.length > 1) throw Error('Usage: node scripts/setup.mjs [--with-deps]');
if (args.length && process.platform !== 'linux') throw Error('--with-deps is only needed on Linux. Omit it here.');
run('npm', ['ci']);
run(process.execPath, ['node_modules/playwright/cli.js', 'install', ...args, 'chromium', 'firefox']);
console.log('Setup complete. Next: npm run verify, then npm run dev.');
