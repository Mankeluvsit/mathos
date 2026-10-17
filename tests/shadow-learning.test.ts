import { describe, expect, it } from 'vitest';
import { advanceShadow, startShadow } from '../src/ecology/shadow-learning';
import { initialize, step } from '../src/ecology/oriented-model';

const definition = { format: 'mathos-ecology' as const, version: 2 as const, seed: 42, mode: 'seeded' as const };

describe('shadow learning over real v2 transitions', () => {
  it('does not modify the actual v2 simulation in either arm', () => {
    let plain = initialize(definition);
    let frozen = startShadow(definition, false);
    let learning = startShadow(definition, true);
    for (let tick = 0; tick < 30; tick++) {
      plain = step(plain);
      frozen = advanceShadow(frozen);
      learning = advanceShadow(learning);
      expect(frozen.world).toEqual(plain);
      expect(learning.world).toEqual(plain);
    }
    expect(frozen.totalUpdates).toBe(0);
    expect(learning.totalUpdates).toBeGreaterThan(0);
    expect([...frozen.records.values()].every(record => record.updates === 0)).toBe(true);
  });
  it('replays the same shadow weights deterministically', () => {
    const run = () => {
      let state = startShadow(definition, true);
      for (let i = 0; i < 25; i++) state = advanceShadow(state);
      return state;
    };
    expect(run()).toEqual(run());
  });
  it('does not mutate the previous shadow snapshot', () => {
    const old = startShadow(definition, true);
    const weights = structuredClone([...old.records.entries()]);
    const next = advanceShadow(old);
    expect([...old.records.entries()]).toEqual(weights);
    expect(next).not.toBe(old);
  });
});
