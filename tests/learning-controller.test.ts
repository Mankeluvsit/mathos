import { describe, expect, it } from 'vitest';
import reference from './fixtures/learning-controller.v1.json';
import {
  actionValues, chooseAction, createController, deriveStreams, learn,
  MAX_UPDATES, measuredReward, observe, type Controller, type Transition,
} from '../src/ecology/learning-controller';

const bias = [64, 0, 0, 0, 0, 0];
const empty = (): Controller => ({ weights: Array.from({ length: 4 }, () => Array<number>(6).fill(0)), updates: 0 });
const event: Transition = { input: bias, action: 0, reward: 1, nextInput: null, enabled: true };

describe('isolated linear-td@1 controller', () => {
  it('matches every independent Python update, including signed truncation, clipping and frozen cases', () => {
    expect(reference.cases).toHaveLength(75);
    for (const c of reference.cases) {
      expect(learn(c.controller, c.transition), c.name).toEqual(c.expected);
    }
  });

  it('matches independent two-draw exploration and stream derivations, including uint32 endpoints', () => {
    for (const c of reference.decisions) expect(chooseAction(c.controller, c.input, c.rngState)).toEqual(c.expected);
    for (const c of reference.streams) expect(deriveStreams(c.seed, c.id)).toEqual(c.expected);
    // 0's gate is greedy; tie order must be stable even when every score is zero.
    expect(chooseAction(empty(), bias, 0)).toMatchObject({ action: 0, exploring: false });
  });

  it('scales measured signals and energy with documented saturation and quantization', () => {
    expect(observe([15, 16, 1023, 1024], 599)).toEqual([64, 0, 1, 63, 64, 63]);
    expect(observe([0, 0, 0, Number.MAX_SAFE_INTEGER], 600)).toEqual([64, 0, 0, 0, 64, 64]);
    expect(observe([0, 0, 0, 0], 0)).toEqual(bias);
    expect(measuredReward(48, 0, 0)).toBe(32);
    expect(measuredReward(0, 3, 4)).toBe(-7);
    expect(measuredReward(24, 2, 3)).toBe(19);
  });

  it('initializes from bounded birth genes without inheriting learned state', () => {
    const birth = createController(3, 2);
    expect(birth).toEqual({ weights: [[32, 768, 0, 0, 0, 0], [0, 0, 768, 0, 0, 0], [0, 0, 0, 768, 0, 0], [0, 0, 0, 0, 768, 0]], updates: 0 });
    const trained = learn(birth, event).controller;
    expect(trained).not.toEqual(birth);
    expect(createController(3, 2)).toEqual(birth);
    expect(createController(6, 6).weights[0]).toEqual([96, 1536, 0, 0, 0, 0]);
    expect(createController(1, 0).weights[0]).toEqual([0, 256, 0, 0, 0, 0]);
  });

  it('changes only the selected row and returns independent copies even for frozen learning', () => {
    const c = createController(3, 2);
    c.weights.forEach(Object.freeze);
    Object.freeze(c.weights);
    Object.freeze(c);
    const input = Object.freeze([...bias]);
    const learned = learn(c, { ...event, input, action: 2 });
    expect(learned.changes).toEqual([4, 0, 0, 0, 0, 0]);
    expect(learned.controller.updates).toBe(1);
    for (const a of [0, 1, 3]) expect(learned.controller.weights[a]).toEqual(c.weights[a]);
    const frozen = learn(c, { ...event, enabled: false });
    expect(frozen.controller).toEqual(c);
    expect(frozen.updated).toBe(false);
    expect(frozen.changes).toEqual([0, 0, 0, 0, 0, 0]);
    frozen.controller.weights[0]![0] = 999;
    learned.controller.weights[1]![0] = 888;
    expect(c.weights[0]![0]).toBe(32);
    expect(c.weights[1]![0]).toBe(0);
    expect(input).toEqual(bias);
  });

  it('excludes future value at terminal transitions and counts zero-effect enabled updates', () => {
    const c = createController(3, 2);
    const terminal = learn(c, { ...event, reward: 0 });
    const live = learn(c, { ...event, reward: 0, nextInput: [64, 64, 0, 0, 0, 0] });
    expect(terminal.nextQ).toBe(0);
    expect(terminal.delta).toBe(-32);
    expect(live.nextQ).toBe(800);
    expect(live.delta).toBe(568);
    const zero = learn(empty(), { ...event, reward: 0 });
    expect(zero.controller.updates).toBe(1);
    expect(zero.changes).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('changes a later choice after rewarded experience while the identical frozen control stays fixed', () => {
    const start = empty();
    const rewardedRight = { ...event, action: 1 };
    const trained = learn(start, rewardedRight).controller;
    const frozen = learn(start, { ...rewardedRight, enabled: false }).controller;
    expect(chooseAction(start, bias, 0).action).toBe(0);
    expect(chooseAction(trained, bias, 0).action).toBe(1);
    expect(chooseAction(frozen, bias, 0).action).toBe(0);
    expect(chooseAction(trained, bias, 0).rngState).toBe(chooseAction(frozen, bias, 0).rngState);
  });

  it('keeps exact numeric bounds and repeatable decisions through the entire update budget', () => {
    expect(actionValues({ weights: Array.from({ length: 4 }, () => Array<number>(6).fill(4096)), updates: 0 }, Array(6).fill(64))).toEqual([24576, 24576, 24576, 24576]);
    function run() {
      let c = createController(6, 6), rng = deriveStreams(4294967295, 256).exploration;
      for (let i = 0; i < MAX_UPDATES; i++) {
        const input = observe([i, 1024, i % 16, 0], i % 601);
        const choice = chooseAction(c, input, rng);
        const next = learn(c, { input, action: choice.action, reward: i % 2 ? -32 : 32, nextInput: i === MAX_UPDATES - 1 ? null : bias, enabled: true });
        expect(Math.abs(next.delta)).toBeLessThanOrEqual(16384);
        expect(next.changes.every((n) => Number.isInteger(n) && Math.abs(n) <= 256)).toBe(true);
        expect(next.controller.weights.flat().every((n) => Number.isInteger(n) && Math.abs(n) <= 4096 && !Object.is(n, -0))).toBe(true);
        c = next.controller;
        rng = choice.rngState;
      }
      return { c, rng };
    }
    const first = run();
    expect(run()).toEqual(first);
    expect(first.c.updates).toBe(MAX_UPDATES);
    expect(() => learn(first.c, event)).toThrow('budget');
    expect(learn(first.c, { ...event, enabled: false }).controller).toEqual(first.c);
  });

  it('rejects invalid numeric/shape inputs before producing a controller decision or update', () => {
    for (const n of [NaN, Infinity, -Infinity, 1.5, -1]) {
      expect(() => observe([n, 0, 0, 0], 0)).toThrow();
      expect(() => deriveStreams(n, 1)).toThrow();
      expect(() => chooseAction(empty(), bias, n)).toThrow();
    }
    expect(() => observe([0, 0, 0, 0], 601)).toThrow();
    expect(() => observe(Array(4), 0)).toThrow();
    expect(() => createController(0, 2)).toThrow();
    expect(() => createController(7, 2)).toThrow();
    expect(() => createController(3, 7)).toThrow();
    expect(() => deriveStreams(4294967296, 1)).toThrow();
    for (const id of [0, 257, 1.5]) expect(() => deriveStreams(42, id)).toThrow();
    expect(() => measuredReward(49, 0, 0)).toThrow();
    expect(() => measuredReward(0, 4, 0)).toThrow();
    expect(() => measuredReward(0, 0, 5)).toThrow();
    for (const input of [[63, 0, 0, 0, 0, 0], [64, 65, 0, 0, 0, 0], [64], Array(6)]) {
      expect(() => actionValues(empty(), input)).toThrow();
    }
    for (const patch of [{ action: 4 }, { reward: 33 }, { reward: NaN }, { nextInput: [64] }]) {
      expect(() => learn(empty(), { ...event, ...patch })).toThrow();
    }
    expect(() => learn(empty(), { ...event, enabled: 'true' } as unknown as Transition)).toThrow();
    expect(() => learn({ weights: [], updates: 0 }, event)).toThrow();
    expect(() => learn({ weights: [[4097, 0, 0, 0, 0, 0], ...empty().weights.slice(1)], updates: 0 }, event)).toThrow();
    expect(() => learn({ ...empty(), updates: -1 }, event)).toThrow();
  });
});
