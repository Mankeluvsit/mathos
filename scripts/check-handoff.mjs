import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const files = ['HANDOFF.md', 'RESUME.md', ...readdirSync('docs/handoff').filter((name) => name.endsWith('.md')).map((name) => `docs/handoff/${name}`)];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    assert.ok(existsSync(resolve(dirname(file), target)), `${file}: broken local link ${target}`);
  }
}
const config = JSON.parse(readFileSync('opencode.json', 'utf8'));
assert.equal(config.default_agent, 'mathos');
for (const instruction of config.instructions) assert.ok(existsSync(instruction), `Missing instruction: ${instruction}`);
for (const folder of ['agents', 'commands']) {
  for (const name of readdirSync(`.opencode/${folder}`)) {
    const text = readFileSync(`.opencode/${folder}/${name}`, 'utf8');
    assert.match(text, /^---\r?\n[\s\S]+?\r?\n---\r?\n/);
    // Custom command file references must exist too.
    for (const match of text.matchAll(/@((?:docs\/|RESUME|AGENTS)[a-zA-Z0-9/_.-]*\.md)/g)) assert.ok(existsSync(match[1]), `Missing file reference: ${match[1]}`);
  }
}
for (const name of readdirSync('.opencode/profiles')) JSON.parse(readFileSync(`.opencode/profiles/${name}`, 'utf8'));
assert.ok(existsSync('.opencode/skills/mathos-verification/SKILL.md'));
console.log('Handoff links, file references and JSON syntax pass. Run opencode:check for the actual OpenCode parser.');
