import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { requireNode } from './dev-tools.mjs';

requireNode();
const args = process.argv.slice(2);
const allowed = new Set(['--check', '--local', '--browser', '--model=deepseek-v4.1-flash-free', '--model=longcat-2.5-preview-free', '--model=big-pickle']);
if (args.some((arg) => !allowed.has(arg)) || args.filter((arg) => arg.startsWith('--model=')).length > 1) {
  throw Error('Usage: node scripts/start-opencode.mjs [--check] [--local] [--browser] [--model=deepseek-v4.1-flash-free|longcat-2.5-preview-free|big-pickle]');
}
if (args.includes('--local') && args.some((arg) => arg.startsWith('--model='))) throw Error('Choose either --local or a hosted --model, not both.');
const profile = args.includes('--local')
  ? JSON.parse(readFileSync('.opencode/profiles/ollama.json', 'utf8'))
  : {
      enabled_providers: ['opencode'],
      model: `opencode/${args.find((arg) => arg.startsWith('--model='))?.slice(8) ?? 'deepseek-v4.1-flash-free'}`,
      provider: { opencode: { options: { apiKey: 'public' } } },
    };
profile.small_model = profile.model;
if (args.includes('--browser')) Object.assign(profile, JSON.parse(readFileSync('.opencode/profiles/playwright.json', 'utf8')));
const env = { ...process.env, OPENCODE_CONFIG_CONTENT: JSON.stringify(profile) };
const options = { env, shell: process.platform === 'win32', encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 60000 };
const version = spawnSync('opencode', ['--version'], options);
if (version.error || version.status !== 0 || version.stdout.trim() !== '1.19.2') throw Error('Install the verified client: npm install -g opencode-ai@1.19.2');
if (!args.includes('--local')) {
  const result = spawnSync('opencode', ['models', 'opencode', '--verbose'], options);
  if (result.error || result.status !== 0) throw Error('Cannot read the OpenCode model catalog. Retry when available; no paid fallback will be used.');
  const models = result.stdout.trim().split(/\r?\n(?=opencode\/)/).map((entry) => {
    const split = entry.indexOf('\n');
    return { name: entry.slice(0, split).trim(), data: JSON.parse(entry.slice(split + 1)) };
  });
  const model = models.find((model) => model.name === profile.model)?.data;
  if (!model || model.status !== 'active' || !model.capabilities?.toolcall || model.cost?.input !== 0 || model.cost?.output !== 0 || Object.values(model.cost?.cache ?? {}).some((value) => value !== 0)) {
    throw Error('Selected model is unavailable or no longer advertised as free with tools. Stop; choose another listed free model or use --local. No paid fallback will be used.');
  }
  console.log(`${profile.model}: catalog reports zero token prices and tool support. Anonymous access uses OpenCode's public token; no personal API key or login is supplied.`);
  console.log('Free hosted availability is temporary/rate-limited. This catalog check is not an inference/access guarantee.');
}
if (!args.includes('--check')) {
  const result = spawnSync('opencode', [], { env, shell: process.platform === 'win32', stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} else console.log(`Configuration selected: ${profile.model}. No model request sent.`);
