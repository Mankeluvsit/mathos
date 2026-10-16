import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

function inspect(args, profile) {
  const env = { ...process.env };
  if (profile) env.OPENCODE_CONFIG_CONTENT = readFileSync(resolve(`.opencode/profiles/${profile}.json`), 'utf8');
  const result = spawnSync('opencode', args, { encoding: 'utf8', env, shell: process.platform === 'win32', maxBuffer: 8 * 1024 * 1024, timeout: 60000 });
  if (result.error || result.status !== 0) {
    throw Error(`OpenCode ${args.join(' ')} failed. Install opencode-ai@1.19.2, then run opencode debug config locally for details. Do not publish its full output; merged user settings can contain credentials.`);
  }
  return result.stdout.trim();
}
assert.equal(inspect(['--version']), '1.19.2', 'This package is verified against OpenCode 1.19.2. Revalidate before upgrading.');
for (const profile of [undefined, 'ollama', 'playwright']) {
  const c = JSON.parse(inspect(['debug', 'config'], profile));
  assert.equal(c.default_agent, 'mathos');
  assert.equal(c.agent.mathos.mode, 'primary');
  assert.equal(c.agent['mathos-review'].mode, 'subagent');
  assert.equal(c.agent['mathos-review'].permission.edit, 'deny');
  assert.equal(c.agent['mathos-scout'].permission.task, 'deny');
  for (const command of ['mathos-resume', 'mathos-unit', 'mathos-review', 'mathos-checkpoint']) assert.ok(c.command[command]?.template);
  if (profile === 'ollama') {
    assert.equal(c.model, 'ollama/mathos-qwen35-9b');
    assert.equal(c.provider.ollama.options.baseURL, 'http://127.0.0.1:11434/v1');
  }
  if (profile === 'playwright') assert.equal(c.mcp.browser.type, 'local');
  console.log(`OpenCode 1.19.2 parsed ${profile ?? 'base'} configuration, agents and commands.`);
}
const skills = JSON.parse(inspect(['debug', 'skill']));
assert.ok(skills.some((skill) => skill.name === 'mathos-verification'));
console.log('OpenCode discovered mathos-verification. No model inference or provider authentication was performed.');
