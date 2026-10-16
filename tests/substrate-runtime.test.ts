import { describe, expect, it, vi } from 'vitest';
import example from '../examples/substrate-run.v1.json';
import { validateSubstrateRun } from '../src/domain/substrate-run';
import { SubstrateRuntime, type Scheduler, type Rate } from '../src/runtime/substrate-runtime';
import { initialize } from '../src/simulation/initialize';
import * as engine from '../src/simulation/step';

class Clock implements Scheduler {
  callbacks = new Map<number, (time: number) => void>();
  id = 0;
  request(callback: (time: number) => void) { this.callbacks.set(++this.id, callback); return this.id; }
  cancel(id: number) { this.callbacks.delete(id); }
  now() { return 0; }
  fire(time: number) {
    const pending = [...this.callbacks.values()]; this.callbacks.clear();
    for (const callback of pending) callback(time);
  }
}
const definition = validateSubstrateRun({ ...example, universe: { width: 8, height: 8 }, seed: 0 });

describe('bounded runtime', () => {
  it.each([1, 10, 30] as Rate[])('matches direct and single-step execution at %i ticks/s', (rate) => {
    const clock = new Clock(), runtime = new SubstrateRuntime(definition, clock);
    const manual = new SubstrateRuntime(definition, new Clock());
    let direct = initialize(definition);
    expect(runtime.summary().status).toBe('paused');
    runtime.setRate(rate); runtime.start(); clock.fire(0);
    for (let i = 1; i <= 40; i++) { clock.fire(i * 1000 / rate); manual.singleStep(); direct = engine.step(direct); }
    runtime.pause();
    expect(runtime.snapshot().field).toEqual(direct.field);
    expect(manual.snapshot().field).toEqual(direct.field);
    expect(runtime.summary().tick).toBe(40);
    runtime.dispose(); manual.dispose();
  });
  it('caps catch-up, clears debt on pause/rate change, and ignores stale/disposed callbacks', () => {
    const clock = new Clock(), runtime = new SubstrateRuntime(definition, clock);
    runtime.start(); clock.fire(0); clock.fire(1e9);
    expect(runtime.summary().tick).toBe(4);
    const stale = [...clock.callbacks.values()][0]!;
    runtime.pause(); runtime.start(); stale(2e9);
    expect(runtime.summary().tick).toBe(4);
    clock.fire(2e9); expect(runtime.summary().tick).toBe(4);
    runtime.setRate(30); clock.fire(3e9); expect(runtime.summary().tick).toBe(4);
    const listener = vi.fn(); runtime.subscribe(listener);
    const late = [...clock.callbacks.values()][0]!;
    runtime.dispose(); late(4e9); runtime.singleStep(); runtime.start(); runtime.reset();
    expect(listener).not.toHaveBeenCalled(); expect(clock.callbacks.size).toBe(0);
  });
  it('isolates configuration and snapshots, resets identically, and validates coordinates', () => {
    const input = structuredClone(definition), runtime = new SubstrateRuntime(input, new Clock());
    const before = runtime.snapshot(); const saved = before.field.slice();
    before.field[0] = 0;
    expect(runtime.snapshot().field).toEqual(saved);
    runtime.singleStep(); expect(runtime.summary().tick).toBe(1);
    expect(before.tick).toBe(0);
    runtime.reset(); expect(runtime.snapshot().field).toEqual(saved); expect(runtime.summary().status).toBe('paused');
    expect(() => runtime.pixel(-1, 0)).toThrow(); expect(() => runtime.pixel(8, 0)).toThrow();
    expect(() => runtime.setRate(2 as Rate)).toThrow();
    runtime.dispose();
  });
  it('stops exactly at the tick limit', () => {
    const runtime = new SubstrateRuntime(definition, new Clock());
    for (let i = 0; i < 10005; i++) runtime.singleStep();
    expect(runtime.summary()).toMatchObject({ tick: 10000, status: 'completed' });
    runtime.start(); expect(runtime.summary().status).toBe('completed');
    runtime.reset(); expect(runtime.summary().tick).toBe(0); runtime.dispose();
  });
  it('stops on engine errors and does not publish every animation frame', () => {
    const clock = new Clock(), runtime = new SubstrateRuntime(definition, clock), listener = vi.fn();
    runtime.subscribe(listener); runtime.start(); clock.fire(0);
    for (let t = 1; t < 250; t++) clock.fire(t);
    expect(listener.mock.calls.length).toBe(2); // Start and first frame only.
    vi.spyOn(engine, 'step').mockImplementationOnce(() => { throw new Error('injected invariant failure'); });
    clock.fire(1000);
    expect(runtime.summary()).toMatchObject({ status: 'error', error: 'injected invariant failure' });
    expect(clock.callbacks.size).toBe(0); runtime.dispose();
  });
});
