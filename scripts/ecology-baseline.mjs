import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { BASELINE_SEEDS, measureBaseline } from '../src/ecology/baseline.ts';

const args = process.argv.slice(2);
if (args.length > 1) throw Error('Usage: node scripts/ecology-baseline.mjs [output.json]');
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const sourceDirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim().length > 0;
const result = {
  format: 'mathos-ecology-baseline',
  version: 1,
  engine: 'ecology-reference@2',
  rng: 'mulberry32@1',
  controller: 'fixed-inherited-directional-scores',
  learning: false,
  sourceCommit,
  sourceDirty,
  node: process.version,
  seeds: BASELINE_SEEDS,
  ticksPerSeed: 1600,
  populationTicksDefinition: 'Sum of living population after ticks 1 through the requested horizon; excludes tick 0.',
  note: 'Measured fixed-controller endpoints. No learning treatment, checkpoint, or claim of improvement.',
  runs: BASELINE_SEEDS.map((seed) => measureBaseline(seed)),
};
const json = `${JSON.stringify(result, null, 2)}\n`;
if (args[0]) {
  const target = resolve(args[0]);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, json, { flag: 'wx' });
  console.log(`Saved ${result.runs.length} baseline runs to ${target}`);
} else process.stdout.write(json);
