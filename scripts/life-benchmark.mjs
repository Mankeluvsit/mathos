import { readFileSync } from 'node:fs';
import { initializeLife, stepLife, lifeMetrics } from '../src/life/engine.ts';
const example = JSON.parse(readFileSync(new URL('../examples/life-run.v1.json', import.meta.url)));
const results = [];
for (const size of [16, 32, 64]) {
  let state = initializeLife({ ...example, universe: { width: size, height: size } });
  const samples = []; let maxPopulation = 0;
  for (let i = 0; i < 2000; i++) {
    const start = performance.now(); state = stepLife(state); samples.push(performance.now() - start); maxPopulation = Math.max(maxPopulation, state.organisms.length);
  }
  samples.sort((a, b) => a - b);
  results.push({ size, ticks: state.tick, maxPopulation, medianMs: samples[1000], p95Ms: samples[1900], maxMs: samples.at(-1), final: lifeMetrics(state) });
}
console.log(JSON.stringify({ node: process.version, note: 'Single reference-engine run per size; includes invariant checks, excludes browser/Canvas. Not a hard real-time guarantee.', results }, null, 2));
