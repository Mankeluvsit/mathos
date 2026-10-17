import { expect, it } from 'vitest';
import Ajv from 'ajv';
import schema from '../schemas/ecology-v3.schema.json';
import example from '../examples/ecology.v3.json';
import { initialize, step, copy, validate, assertWorld, type World } from '../src/ecology/learning-model';
import { createController, deriveStreams, learn, observe } from '../src/ecology/learning-controller';
import { ecologyMetrics, initializeEcology, parseEcology, isLearning, isGenome, copyEcology } from '../src/ecology/world';
import { saveEcology, loadEcology } from '../src/ecology/storage';
import { exportObservations } from '../src/ecology/observations';
import { compareLearning, pairedDifferences } from '../src/ecology/learning-experiments';
import { EcologyRuntime } from '../src/runtime/ecology-runtime';

const definition = { format: 'mathos-ecology', version: 3, seed: 42, mode: 'seeded', learning: true } as const;
function rebalance(s: World) {
  s.initial = ecologyMetrics(s).accounted - s.sunlight;
  assertWorld(s);
}
function solo() {
  const s = initialize(definition);
  s.creatures = s.creatures.slice(0, 1); s.lineage = s.lineage.slice(0, 1); s.food.fill(0);
  rebalance(s); return s;
}

it('matches the v3 schema, refuses ambiguity, preserves old versions and isolates storage slots', () => {
  const check = new Ajv().compile(schema);
  expect(check(example)).toBe(true); expect(validate(example)).toEqual(definition);
  expect(Object.isFrozen(validate(example))).toBe(true);
  for (const input of [{ ...definition, learning: undefined }, { ...definition, learning: 'true' }, { ...definition, seed: -1 }, { ...definition, extra: true }, { ...definition, version: 4 }]) {
    expect(check(input)).toBe(false); expect(() => parseEcology(JSON.stringify(input))).toThrow();
  }
  expect(() => parseEcology(' '.repeat(65537))).toThrow('64 KiB');
  const map = new Map<string, string>();
  const port = { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); } };
  saveEcology(port, definition); expect(loadEcology(port, 3)).toEqual(definition);
  expect(() => loadEcology(port, 2)).toThrow();
  map.set('mathos.ecology.v2', JSON.stringify(definition)); expect(() => loadEcology(port, 2)).toThrow('different model');
  expect(isLearning(initializeEcology(definition))).toBe(true);
  expect(initializeEcology({ format: 'mathos-ecology', version: 2, seed: 42, mode: 'seeded' }).definition.version).toBe(2);
});

it('starts paired worlds identically except for the learning flag and records actual transitions', () => {
  const on = initialize(definition), off = initialize({ ...definition, learning: false });
  expect(on.food).toEqual(off.food); expect(on.creatures).toEqual(off.creatures);
  expect(on.rng).toBe(off.rng); expect(on.reproductionRng).toBe(off.reproductionRng);
  const before = copy(on), next = step(on), frozen = step(off);
  expect(on).toEqual(before);
  for (let i = 0; i < next.creatures.length; i++) {
    const c = next.creatures[i]!, previous = on.creatures[i]!, d = c.lastDecision!;
    expect(c.controller.updates).toBe(1);
    expect(frozen.creatures[i]!.controller).toEqual(previous.controller);
    expect(c.explorationRng).toBe(frozen.creatures[i]!.explorationRng);
    expect(d.reward).toBe(Math.max(-32, Math.min(32, d.intake - d.mechanicalCost - d.upkeep)));
    expect(c.controller).toEqual(learn(previous.controller, { input: d.input, action: d.relative, reward: d.reward, nextInput: d.nextInput, enabled: true }).controller);
    expect(Math.abs(c.x - previous.x) + Math.abs(c.y - previous.y)).toBeLessThanOrEqual(1);
    if (c.direction !== previous.direction) expect([c.x,c.y]).toEqual([previous.x,previous.y]);
  }
  expect(ecologyMetrics(next).supplied).toBe(ecologyMetrics(next).accounted);
});

it('makes juveniles wait until the tick after motor development and excludes growth cost from reward', () => {
  let s = solo(); const child = s.creatures[0]!;
  child.size = 2; child.age = 9; child.energy = 100;
  const rng = child.explorationRng; rebalance(s);
  s = step(s); const grown = s.creatures[0]!;
  expect(grown.size).toBe(3); expect(grown.energy).toBe(90);
  expect(grown.controller.updates).toBe(0); expect(grown.explorationRng).toBe(rng); expect(grown.lastDecision).toBeNull();
  s = step(s); expect(s.creatures[0]!.controller.updates).toBe(1);
  const grazer = solo(); const c = grazer.creatures[0]!;
  c.genes.bodyPlan = 'grazer'; c.size = 3; c.age = 19; c.energy = 150; rebalance(grazer);
  const next = step(grazer).creatures[0]!;
  expect(next.size).toBe(4);
  expect(next.lastDecision!.upkeep).toBe(3);
  expect(next.lastDecision!.nextInput).toEqual(observe([0,0,0,0],next.energy));
  expect(next.lastDecision!.reward).toBe(-next.lastDecision!.mechanicalCost - 3);
});

it('resets each child controller and RNG from its own birth genes instead of copying its parent', () => {
  const s = solo(); const parent = s.creatures[0]!;
  parent.age = 39; parent.energy = 500;
  parent.controller = learn(parent.controller, { input: [64,0,0,0,0,0], action: 0, reward: 32, nextInput: null, enabled: true }).controller;
  s.tick = 1; rebalance(s);
  const next = step(s), child = next.creatures.find(c => c.parent === 1)!;
  expect(child).toBeDefined(); expect(child.age).toBe(0); expect(child.lastDecision).toBeNull();
  expect(child.controller).toEqual(createController(child.genes.foodWeight, child.genes.inertia));
  expect(child.explorationRng).toBe(deriveStreams(42, child.id).exploration);
  expect(child.controller.weights).not.toBe(next.creatures[0]!.controller.weights);
  const d = next.creatures[0]!.lastDecision!;
  expect(d.reward).toBe(d.intake - d.mechanicalCost - d.upkeep);
  expect(next.creatures[0]!.energy).toBe(500 + d.intake - d.mechanicalCost - d.upkeep - 116);
});

it('finalizes blocked/death transitions once and uses terminal bootstrap at the world horizon', () => {
  const s = solo(); s.creatures[0]!.energy = 0; rebalance(s);
  const dead = step(s); expect(dead.creatures).toHaveLength(0);
  const record = dead.lineage[0]!; expect(record.updates).toBe(1);
  expect(record.lastDecision).toMatchObject({ terminal: true, nextInput: null, nextQ: 0, mechanicalCost: 0 });
  expect(record.lastDecision!.actual).toContain('blocked');
  expect(step(dead).lineage[0]).toEqual(record);
  const final = solo(); final.tick = 1599;
  const end = step(final); expect(end.creatures[0]!.lastDecision).toMatchObject({ terminal: true, nextQ: 0 });
  expect(() => step(end)).toThrow('complete');
});

it('deep-copies runtime snapshots and observation exports including learned diagnostics', () => {
  const runtime = new EcologyRuntime(definition); runtime.singleStep();
  const snapshot = runtime.snapshot(); if (!isLearning(snapshot) || isGenome(snapshot)) throw Error('Wrong model');
  const original = copy(snapshot);
  snapshot.creatures[0]!.lastDecision!.input[0] = 999;
  (snapshot.creatures[0]!.controller.weights[0] as number[])[0] = 999;
  expect(runtime.snapshot()).toEqual(original);
  const out = exportObservations(original);
  expect(out).toMatchObject({ version: 2, engine: 'ecology-reference@3', controller: 'linear-td@1' });
  const record = out.lineage[0]!; if (!('lastDecision' in record)) throw Error('Missing diagnostics');
  record.lastDecision!.changes[0] = 888;
  expect(original.lineage[0]!.lastDecision!.changes[0]).not.toBe(888);
  expect(copyEcology(original)).toEqual(original); runtime.dispose();
});

it('runs both treatments across all declared seeds and reports honest partial and failed comparisons', async () => {
  const source = { revision: 'test', dirty: true };
  const complete = await compareLearning(source, new AbortController().signal, () => {}, async () => {}, 12);
  expect(complete.status).toBe('completed'); expect(complete.runs).toHaveLength(12);
  expect(pairedDifferences(complete).every(p => p.difference !== null)).toBe(true);
  for (const r of complete.runs) {
    expect(r.metrics.accounted).toBe(r.metrics.supplied);
    expect(r.updates).toBe(r.definition.learning ? 96 : 0);
    expect(r.populationTicks).toBe(96);
  }
  const abort = new AbortController();
  const cancelled = await compareLearning(source, abort.signal, () => abort.abort(), async () => {}, 12);
  expect(cancelled.status).toBe('cancelled'); expect(cancelled.runs).toHaveLength(1);
  expect(cancelled.runs[0]!.ticks).toBeLessThanOrEqual(4);
  expect(pairedDifferences(cancelled).every(p => p.difference === null)).toBe(true);
  const failed = await compareLearning(source, new AbortController().signal, () => { throw Error('test failure'); }, async () => {}, 12);
  expect(failed.status).toBe('failed'); expect(failed.runs[0]!.status).toBe('failed'); expect(failed.reason).toBe('test failure');
});

it('has no invented organisms or learning in primordial mode', () => {
  const next = step(initialize({ ...definition, mode: 'primordial' }));
  expect(next.creatures).toHaveLength(0); expect(next.lineage).toHaveLength(0);
  expect(ecologyMetrics(next).supplied).toBe(ecologyMetrics(next).accounted);
});
