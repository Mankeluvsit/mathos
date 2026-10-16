import { describe, expect, it } from 'vitest';
import example from '../examples/substrate-run.v1.json';
import reference from './fixtures/substrate/reference.json';
import { validateSubstrateRun } from '../src/domain/substrate-run';
import { initialize } from '../src/simulation/initialize';
import { nextRandom } from '../src/simulation/rng';
import { measure } from '../src/simulation/metrics';
import { step } from '../src/simulation/step';

describe('independent reproducibility fixtures', () => {
  it.each(reference.vectors)('matches uint32 RNG vector for seed $seed', (vector) => {
    let state = vector.seed;
    const values = vector.values.map(() => { const draw = nextRandom(state); state = draw.state; return draw.value; });
    expect(values).toEqual(vector.values); expect(state).toBe(vector.state);
  });
  it.each(reference.cases)('matches independent trajectory: seed $seed, $boundary, $initializer', (fixture) => {
    let state = initialize({ ...example, seed: fixture.seed, universe: { width: fixture.width, height: fixture.height },
      initializer: { id: fixture.initializer, version: 1 }, rules: { ...example.rules, boundary: fixture.boundary, transferDivisor: fixture.divisor } });
    for (const frame of fixture.frames) {
      while (state.tick < frame.tick) state = step(state);
      expect([...state.field]).toEqual(frame.field);
      expect(state.metrics).toEqual({ sum: frame.sum, min: frame.min, max: frame.max });
      expect(state.rngState).toBe(fixture.rngState);
    }
  });
});

describe('transport invariants', () => {
  const small = validateSubstrateRun({ ...example, universe: { width: 8, height: 8 } });
  it.each(['periodic', 'closed'] as const)('handles corner edges exactly once: %s', (boundary) => {
    const initial = initialize({ ...small, rules: { ...small.rules, boundary } });
    initial.field.fill(0); initial.field[0] = 65535;
    const before = { ...initial, metrics: measure(initial.field) };
    const after = step(before);
    expect(after.field[0]).toBe(boundary === 'periodic' ? 32771 : 49153);
    expect(after.field[1]).toBe(8191); expect(after.field[8]).toBe(8191);
    expect(after.field[7]).toBe(boundary === 'periodic' ? 8191 : 0);
    expect(after.field[56]).toBe(boundary === 'periodic' ? 8191 : 0);
    expect(after.metrics.sum).toBe(65535);
    expect(before.field[0]).toBe(65535);
  });
  it('keeps uniform fields and sub-unit gradients stable, including the maximum total', () => {
    const initial = initialize({ ...example, universe: { width: 256, height: 256 } });
    initial.field.fill(65535);
    const uniform = { ...initial, metrics: measure(initial.field) };
    expect(step(uniform).metrics).toEqual({ sum: 4294901760, min: 65535, max: 65535 });
    const tiny = initialize(small); tiny.field.fill(1); tiny.field[0] = 7;
    expect(step({ ...tiny, metrics: measure(tiny.field) }).field).toEqual(tiny.field);
  });
  it.each([0, 1, 4294967295])('conserves exact totals and bounds over long runs: seed %i', (seed) => {
    for (const boundary of ['periodic', 'closed']) for (const divisor of [8, 16]) {
      let state = initialize({ ...small, seed, universe: { width: 8, height: 16 }, rules: { ...small.rules, boundary, transferDivisor: divisor } });
      const original = state, initial = state.field.slice();
      for (let i = 0; i < 1000; i++) state = step(state);
      expect(state.metrics.sum).toBe(original.metrics.sum);
      expect(state.metrics.min).toBeGreaterThanOrEqual(original.metrics.min);
      expect(state.metrics.max).toBeLessThanOrEqual(original.metrics.max);
      expect(original.field).toEqual(initial);
    }
  });
  it('tests maximum dimensions under both boundaries/divisors and rejects invalid state', () => {
    for (const boundary of ['periodic', 'closed']) for (const divisor of [8, 16]) {
      const original = initialize({ ...example, seed: 4294967295, universe: { width: 256, height: 256 }, rules: { ...example.rules, boundary, transferDivisor: divisor } });
      let state = original;
      for (let i = 0; i < 8; i++) state = step(state);
      expect(state.metrics.sum).toBe(original.metrics.sum);
    }
    const state = initialize(small);
    expect(() => step({ ...state, tick: 10000 })).toThrow('limit');
    expect(() => step({ ...state, field: new Uint16Array(1) })).toThrow('dimensions');
    expect(() => step({ ...state, metrics: { ...state.metrics, sum: -1 } })).toThrow('conservation');
  });
});
