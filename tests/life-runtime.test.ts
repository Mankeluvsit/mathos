import { expect, it, vi } from 'vitest';
import { LifeRuntime, type Scheduler } from '../src/runtime/life-runtime';
import { DEFAULT_EXPERIMENT } from '../src/domain/experiment';
import { lifeFromExperiment } from '../src/domain/life-run';
import { initializeLife, stepLife } from '../src/life/engine';
const definition = lifeFromExperiment({ ...DEFAULT_EXPERIMENT, universe: { width: 8, height: 8 }, genesis: { mode: 'seeded' } });
class Clock implements Scheduler {
  callbacks = new Map<number, (time: number) => void>(); id = 0;
  request(callback: (time: number) => void) { this.callbacks.set(++this.id, callback); return this.id; }
  cancel(id: number) { this.callbacks.delete(id); } now() { return 0; }
  fire(time: number) { const pending = [...this.callbacks.values()]; this.callbacks.clear(); for (const cb of pending) cb(time); }
}
it('life animation pacing matches direct ticks and cannot catch up without bounds', () => {
  const clock = new Clock(), r = new LifeRuntime(definition, clock); let direct = initializeLife(definition);
  r.start(); clock.fire(0); for (let i = 1; i <= 20; i++) { clock.fire(i * 100); direct = stepLife(direct); }
  expect(r.snapshot()).toEqual(direct); clock.fire(1e9); expect(r.summary().tick).toBe(24);
  const stale = [...clock.callbacks.values()][0]!; r.pause(); r.start(); stale(2e9); expect(r.summary().tick).toBe(24);
  r.dispose(); clock.fire(3e9); expect(clock.callbacks.size).toBe(0);
});
it('life snapshots protect nested state and reset replays the initial definition', () => {
  const r = new LifeRuntime(definition, new Clock()), before = r.snapshot(), snapshot = r.snapshot();
  snapshot.organisms[0]!.genome.bias = 8; snapshot.lineage[0]!.died = 2; snapshot.field[0] = 0;
  expect(r.snapshot()).toEqual(before); r.singleStep(); r.reset(); expect(r.snapshot()).toEqual(before); r.dispose();
});
it('life runtime stops at its exact cap and disposed callbacks cannot publish', () => {
  const clock = new Clock(), r = new LifeRuntime(definition, clock);
  for (let i = 0; i < 2005; i++) r.singleStep(); expect(r.summary()).toMatchObject({ tick: 2000, status: 'completed' });
  r.reset(); const listener = vi.fn(); r.subscribe(listener); r.dispose(); r.start(); r.singleStep(); expect(listener).not.toHaveBeenCalled();
});
