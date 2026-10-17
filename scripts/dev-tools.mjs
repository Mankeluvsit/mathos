import { spawnSync } from 'node:child_process';

export function requireNode() {
  if (Number(process.versions.node.split('.')[0]) !== 24) throw Error('Use Node.js 24; see docs/handoff/SETUP.md.');
}

export function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    // npm.cmd needs cmd.exe on Windows. Callers supply fixed argument lists only.
    shell: process.platform === 'win32' && command === 'npm',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw Error(`${command} ${args.join(' ')} failed (${result.status ?? result.signal}).`);
}

export function python() {
  const candidates = process.platform === 'win32'
    ? [['py', ['-3']], ['python', []], ['python3', []]]
    : [['python3', []], ['python', []]];
  for (const [command, prefix] of candidates) {
    const result = spawnSync(command, [...prefix, '-c', 'import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)'], { stdio: 'ignore' });
    if (result.status === 0) return { command, prefix };
  }
  throw Error('Python 3.10+ was not found. Install Python as described in docs/handoff/SETUP.md.');
}
