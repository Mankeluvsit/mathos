import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium, firefox } from 'playwright';
import { startServer } from './browser-server.mjs';

const reference = JSON.parse(readFileSync(new URL('../tests/fixtures/substrate/reference.json', import.meta.url)));
const example = JSON.parse(readFileSync(new URL('../examples/substrate-run.v1.json', import.meta.url)));
const stop = await startServer('dev', 4174);
try {
  for (const type of [chromium, firefox]) {
    const browser = await type.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto('http://127.0.0.1:4174');
      // A dev-only test harness imports the real modules; no debug API is shipped.
      const result = await page.evaluate(async ({ reference, example }) => {
        const { initialize } = await import('/src/simulation/initialize.ts');
        const { step } = await import('/src/simulation/step.ts');
        const { nextRandom } = await import('/src/simulation/rng.ts');
        const { SubstrateRuntime } = await import('/src/runtime/substrate-runtime.ts');
        for (const vector of reference.vectors) {
          let state = vector.seed;
          for (const expected of vector.values) {
            const next = nextRandom(state); state = next.state;
            if (next.value !== expected) throw Error('Browser RNG vector mismatch');
          }
        }
        for (const fixture of reference.cases) {
          let state = initialize({ ...example, seed: fixture.seed, universe: { width: fixture.width, height: fixture.height },
            initializer: { id: fixture.initializer, version: 1 }, rules: { ...example.rules, boundary: fixture.boundary, transferDivisor: fixture.divisor } });
          for (const frame of fixture.frames) {
            while (state.tick < frame.tick) state = step(state);
            if (state.field.some((v, i) => v !== frame.field[i])) throw Error('Browser golden field mismatch');
          }
        }
        const benchmarks = [];
        for (const size of [64, 256]) for (const ticks of [100, 1000]) {
          const definition = { ...example, universe: { width: size, height: size } };
          let warm = initialize(definition);
          for (let i = 0; i < 25; i++) warm = step(warm);
          let state = initialize(definition);
          const samples = [];
          for (let i = 0; i < ticks; i++) {
            const start = performance.now(); state = step(state); samples.push(performance.now() - start);
          }
          samples.sort((a, b) => a - b);
          benchmarks.push({ size, ticks, medianMs: samples[Math.floor(ticks / 2)], p95Ms: samples[Math.floor(ticks * .95)] });
        }
        const batches = [];
        for (const size of [64, 256]) {
          let callback;
          const scheduler = { request(cb) { callback = cb; return 1; }, cancel() { callback = undefined; }, now() { return performance.now(); } };
          const runtime = new SubstrateRuntime({ ...example, universe: { width: size, height: size } }, scheduler);
          runtime.start(); callback(0);
          const samples = [];
          for (let time = 1000; runtime.summary().tick < 1000; time += 1000) {
            const start = performance.now(); callback(time); samples.push(performance.now() - start);
          }
          runtime.dispose(); samples.sort((a, b) => a - b);
          batches.push({ size, callbacks: samples.length, p95Ms: samples[Math.floor(samples.length * .95)], maxMs: samples.at(-1) });
        }
        return { vectorsPassed: true, goldenFieldsPassed: true, userAgent: navigator.userAgent, benchmarks, batches };
      }, { reference, example });
      assert.equal(result.vectorsPassed, true); assert.equal(result.goldenFieldsPassed, true);
      console.log(JSON.stringify({ browser: type.name(), version: browser.version(), ...result }));
    } finally { await browser.close(); }
  }
} finally { await stop(); }
