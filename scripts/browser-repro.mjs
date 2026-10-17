import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium, firefox } from 'playwright';
import { startServer } from './browser-server.mjs';

const reference = JSON.parse(readFileSync(new URL('../tests/fixtures/substrate/reference.json', import.meta.url)));
const orientedReference = JSON.parse(readFileSync(new URL('../tests/fixtures/ecology-v2.json', import.meta.url)));
const ecologyReference = JSON.parse(readFileSync(new URL('../tests/fixtures/ecology.json', import.meta.url)));
const lifeReference = JSON.parse(readFileSync(new URL('../tests/fixtures/life-reference.json', import.meta.url)));
const lifeExample = JSON.parse(readFileSync(new URL('../examples/life-run.v1.json', import.meta.url)));
const example = JSON.parse(readFileSync(new URL('../examples/substrate-run.v1.json', import.meta.url)));
const stop = await startServer('dev', 4174);
try {
  for (const type of [chromium, firefox]) {
    const browser = await type.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto('http://127.0.0.1:4174');
      // A dev-only test harness imports the real modules; no debug API is shipped.
      const result = await page.evaluate(async ({ reference, example, lifeReference, lifeExample, ecologyReference, orientedReference }) => {
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
        const { initializeLife, stepLife } = await import('/src/life/engine.ts');
        const normalize = value => Array.isArray(value) ? value.map(normalize) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, normalize(value[key])])) : value;
        for (const fixture of lifeReference.cases) {
          let state = initializeLife({ ...lifeExample, universe: { width: 8, height: 8 }, rules: { ...lifeExample.rules, boundary: fixture.boundary } });
          for (const frame of fixture.frames) {
            while (state.tick < frame.tick) state = stepLife(state);
            const actual = { tick: state.tick, rngState: state.rngState, field: Array.from(state.field), organisms: state.organisms, lineage: state.lineage, dissipated: state.dissipated };
            if (JSON.stringify(normalize(actual)) !== JSON.stringify(normalize(frame))) throw Error('Browser independent life fixture mismatch');
          }
        }
        const { initializeEcology, stepEcology } = await import('/src/ecology/model.ts');
        for (const fixture of ecologyReference.cases) {
          let s = initializeEcology({ format: 'mathos-ecology', version: 1, seed: fixture.seed, mode: 'seeded' });
          for (const frame of fixture.frames) {
            while (s.tick < frame.tick) s = stepEcology(s);
            const value = { tick:s.tick, rng:s.rng, food:Array.from(s.food), creatures:s.creatures, lineage:s.lineage, initial:s.initial, sunlight:s.sunlight, dissipated:s.dissipated, events:s.events };
            const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)))), n => n.toString(16).padStart(2,'0')).join('');
            if (digest !== frame.sha256) throw Error('Ecology golden trajectory mismatch');
          }
        }
        const oriented = await import('/src/ecology/oriented-model.ts');
        for (const fixture of orientedReference.cases) {
          let s = oriented.initialize({ format: 'mathos-ecology', version: 2, seed: fixture.seed, mode: 'seeded' });
          for (const frame of fixture.frames) {
            while (s.tick < frame.tick) s = oriented.step(s);
            const value = { tick:s.tick, rng:s.rng, food:Array.from(s.food), creatures:s.creatures, lineage:s.lineage, initial:s.initial, sunlight:s.sunlight, dissipated:s.dissipated, events:s.events, history:s.history };
            const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)))), n => n.toString(16).padStart(2,'0')).join('');
            if (digest !== frame.sha256) throw Error('Oriented ecology golden trajectory mismatch');
          }
        }
        // The renderer must color the same rotated functional cells used by the engine.
        const { drawEcology } = await import('/src/rendering/ecology-renderer.ts');
        const { drawTerminalEcology } = await import('/src/rendering/ecology-terminal.ts');
        const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 576;
        const ctx = canvas.getContext('2d');
        const colors = { body:[99,198,255], mouth:[244,183,95], motor:[207,136,233], sensor:[124,224,208] };
        const renderWorld = oriented.initialize({ format:'mathos-ecology', version:2, seed:42, mode:'seeded' });
        renderWorld.food.fill(0); renderWorld.creatures = [renderWorld.creatures[2]];
        for (let direction=0; direction<4; direction++) {
          const c=renderWorld.creatures[0]; c.x=20; c.y=20; c.direction=direction;
          drawEcology(ctx,renderWorld,c.id);
          for (const part of oriented.parts(c)) {
            const pixel=ctx.getImageData(part.x*12+3,part.y*12+3,1,1).data;
            if (colors[part.role].some((v,i)=>pixel[i]!==v)) throw Error('Rendered cell did not follow physical body orientation');
          }
          const beforeRender = JSON.stringify(renderWorld);
          drawTerminalEcology(ctx,renderWorld,c.id);
          const terminalColors = { body:[169,223,120], mouth:[255,202,112], motor:[97,212,195], sensor:[191,163,237] };
          for (const part of oriented.parts(c)) {
            const pixels = ctx.getImageData(part.x*12,part.y*12,12,12).data;
            let count=0;
            for (let i=0;i<pixels.length;i+=4) if (terminalColors[part.role].every((v,j)=>pixels[i+j]===v)) count++;
            if (count < 4) throw Error('Terminal role glyph did not match physical part/heading');
          }
          if (JSON.stringify(renderWorld) !== beforeRender) throw Error('Terminal renderer changed scientific state');
        }
        const lifeBenchmarks = [];
        for (const size of [16, 64]) {
          let state = initializeLife({ ...lifeExample, universe: { width: size, height: size } }); const times = [];
          for (let i = 0; i < 500; i++) { const start = performance.now(); state = stepLife(state); times.push(performance.now() - start); }
          times.sort((a,b) => a-b); lifeBenchmarks.push({ size, ticks: 500, p95Ms: times[475], maxMs: times.at(-1) });
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
        return { terminalRenderingPassed: true, orientedGoldenPassed: true, orientedRenderingPassed: true, ecologyGoldenPassed: true, lifeGoldenPassed: true, lifeBenchmarks, vectorsPassed: true, goldenFieldsPassed: true, userAgent: navigator.userAgent, benchmarks, batches };
      }, { reference, example, lifeReference, lifeExample, ecologyReference, orientedReference });
      assert.equal(result.vectorsPassed, true); assert.equal(result.goldenFieldsPassed, true);
      console.log(JSON.stringify({ browser: type.name(), version: browser.version(), ...result }));
    } finally { await browser.close(); }
  }
} finally { await stop(); }
