import { spawn } from 'node:child_process';
import { get } from 'node:http';

// Probe loopback with core HTTP: Node24.21 Undici can throw setTypeOfService EINVAL on macOS.
function ready(port) {
  return new Promise(resolve => {
    const request = get(`http://127.0.0.1:${port}/`, { agent: false }, response => {
      response.resume();
      resolve(response.statusCode >= 200 && response.statusCode < 300);
    });
    request.on('error', () => resolve(false));
    request.setTimeout(500, () => request.destroy());
  });
}

/** Own a single Vite process; do not leave an npm/shell grandchild behind. */
export async function startServer(mode, port) {
  const args = mode === 'preview' ? ['preview'] : [];
  const child = spawn(process.execPath, ['node_modules/vite/bin/vite.js', ...args, '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: 'inherit' });
  const stop = async () => {
    if (child.exitCode !== null || child.signalCode !== null) return;
    const closed = new Promise((resolve) => child.once('exit', resolve));
    child.kill('SIGTERM'); await closed;
  };
  try {
    for (let attempt = 0; attempt < 50; attempt++) {
      if (child.exitCode !== null || child.signalCode !== null) throw new Error('Vite exited before startup.');
      if (await ready(port)) return stop;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    throw new Error('Vite did not start.');
  } catch (error) { await stop(); throw error; }
}
