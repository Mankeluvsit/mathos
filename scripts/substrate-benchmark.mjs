import os from 'node:os';
import { initialize } from '../src/simulation/initialize.ts';
import { step } from '../src/simulation/step.ts';
import { readFileSync } from 'node:fs';

const example = JSON.parse(readFileSync(new URL('../examples/substrate-run.v1.json', import.meta.url)));
const results = [];
for (const size of [64, 256]) for (const ticks of [100, 1000]) {
  const definition = { ...example, universe: { width: size, height: size } };
  let warm = initialize(definition);
  for (let i = 0; i < 25; i++) warm = step(warm);
  let state = initialize(definition);
  global.gc?.();
  let peakBuffers = process.memoryUsage().arrayBuffers;
  const samples = [];
  for (let i = 0; i < ticks; i++) {
    const start = performance.now(); state = step(state); samples.push(performance.now() - start);
    peakBuffers = Math.max(peakBuffers, process.memoryUsage().arrayBuffers);
  }
  global.gc?.();
  await new Promise((resolve) => setTimeout(resolve, 20));
  global.gc?.();
  await new Promise((resolve) => setTimeout(resolve, 20));
  samples.sort((a, b) => a - b);
  results.push({ size, ticks, medianMs: samples[Math.floor(samples.length / 2)], p95Ms: samples[Math.floor(samples.length * .95)], peakAllocatedArrayBufferBytes: peakBuffers,
    retainedArrayBufferBytesAfterGC: process.memoryUsage().arrayBuffers, total: state.metrics.sum });
}
console.log(JSON.stringify({ runtime: process.version, platform: `${os.platform()} ${os.arch()}`, cpu: os.cpus()[0]?.model, logicalCPUs: os.cpus().length, warmupTicks: 25, gcAvailable: Boolean(global.gc),
  memoryNote: 'Process-wide sampled allocated ArrayBuffers include not-yet-collected garbage and warmup state; post-GC reading is retained process memory, not browser Canvas/GPU allocation.', results }, null, 2));
