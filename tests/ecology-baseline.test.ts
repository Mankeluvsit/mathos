import { describe, expect, it } from 'vitest';
import { BASELINE_SEEDS, measureBaseline } from '../src/ecology/baseline';
import { initialize, step } from '../src/ecology/oriented-model';
import { ecologyMetrics } from '../src/ecology/world';

describe('fixed-controller measurement baseline', () => {
  it('matches direct model advancement and counts each observed population exactly once', () => {
    let world = initialize({ format: 'mathos-ecology', version: 2, seed: 42, mode: 'seeded' });
    let populationTicks = 0;
    let peak = 8;
    for (let i = 0; i < 100; i++) {
      world = step(world);
      populationTicks += world.creatures.length;
      peak = Math.max(peak, world.creatures.length);
    }
    const result = measureBaseline(42, 100);
    expect(result.metrics).toEqual(ecologyMetrics(world));
    expect(result.populationTicks).toBe(populationTicks);
    expect(result.peakPopulation).toBe(peak);
    expect(result.totalIntake).toBe(world.lineage.reduce((sum, ancestor) => sum + ancestor.intake, 0));
    expect(result.metrics.accounted).toBe(result.metrics.supplied);
    expect(result.termination).toBe('requested-horizon');
  });
  it('replays independently of a previous run and returns isolated results', () => {
    const first = measureBaseline(0, 40);
    const original = structuredClone(first);
    first.metrics.population = -1;
    measureBaseline(42, 40);
    expect(measureBaseline(0, 40)).toEqual(original);
    expect(BASELINE_SEEDS).toEqual([0, 1, 2, 42, 123456789, 4294967295]);
  });
  it('rejects invalid seeds and unbounded horizons before running', () => {
    for (const ticks of [0, -1, 1601, 1.5, NaN, Infinity]) expect(() => measureBaseline(0, ticks)).toThrow();
    for (const seed of [-1, 4294967296, 1.5, NaN]) expect(() => measureBaseline(seed, 1)).toThrow();
  });
});
