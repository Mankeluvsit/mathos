import reference from './fixtures/life-reference.json';
import { describe, expect, it } from 'vitest';
import { DEFAULT_EXPERIMENT } from '../src/domain/experiment';
import { lifeFromExperiment, parseLifeRun, serializeLifeRun, validateLifeRun } from '../src/domain/life-run';
import { assertLife, copyLife, initializeLife, lifeMetrics, stepLife } from '../src/life/engine';
import { compareSeeds } from '../src/life/experiments';
const definition = lifeFromExperiment({ ...DEFAULT_EXPERIMENT, seed: 42, universe: { width: 8, height: 8 }, genesis: { mode: 'seeded' } });
describe('integrated life reference', () => {
  it('places an actual seeded template without creating resources', () => {
    const s = initializeLife(definition); expect(s.organisms[0]!.cells).toEqual([36]);
    expect(s.organisms[0]!.energy).toBe(256); expect(lifeMetrics(s).accounted).toBe(s.initialTotal);
    expect(s.field[36]).toBeGreaterThanOrEqual(1024 - 288);
  });
  it('primordial has the same initial resource budget but no spontaneous organisms', () => {
    let s = initializeLife(validateLifeRun({ ...definition, genesis: { ...definition.genesis, mode: 'primordial' } }));
    expect(s.initialTotal).toBe(initializeLife(definition).initialTotal);
    for (let i = 0; i < 100; i++) s = stepLife(s);
    expect(s.organisms).toEqual([]); expect(s.lineage).toEqual([]); expect(lifeMetrics(s).dissipated).toBe(0);
  });
  it.each(['closed', 'periodic'] as const)('conserves resources, replays and reaches growth/birth/mutation/death under %s boundaries', boundary => {
    const d = validateLifeRun({ ...definition, rules: { ...definition.rules, boundary } });
    let a = initializeLife(d), b = initializeLife(d); const original = copyLife(a); let grew = false;
    for (let i = 0; i < 2000; i++) {
      a = stepLife(a); b = stepLife(b); expect(a).toEqual(b); expect(lifeMetrics(a).accounted).toBe(a.initialTotal);
      grew ||= a.organisms.some(o => o.cells.length > 1);
    }
    expect(grew).toBe(true); expect(a.lineage.length).toBeGreaterThan(1);
    expect(a.lineage.some(l => l.mutated)).toBe(true); expect(a.lineage.some(l => l.died !== null)).toBe(true);
    expect(initializeLife(d)).toEqual(original); expect(() => stepLife(a)).toThrow('limit');
  });
  it('does not mutate predecessors, snapshot arrays or definitions', () => {
    const s = initializeLife(definition), before = copyLife(s); stepLife(s); expect(s).toEqual(before);
    const copy = copyLife(s); copy.field[0] = 0; copy.organisms[0]!.genome.bias = 8; expect(s).toEqual(before);
    expect(Object.isFrozen(s.definition.rules)).toBe(true);
  });
  it('rejects overlapping or disconnected occupancy', () => {
    const s = initializeLife(definition); s.organisms[0]!.cells.push(0); s.initialTotal += 32;
    expect(() => assertLife(s)).toThrow('disconnected');
  });
  it('round trips definitions and rejects unbounded or unknown input', () => {
    expect(parseLifeRun(serializeLifeRun(definition))).toEqual(definition);
    for (const d of [{ ...definition, extra: true }, { ...definition, engine: 'life-reference@2' }, { ...definition, universe: { width: 65, height: 8 } }, { ...definition, seed: -1 }]) expect(() => validateLifeRun(d)).toThrow();
    expect(() => parseLifeRun(' '.repeat(65537))).toThrow('64 KiB');
  });
  it('runs bounded comparisons with replayable seeds, including uint32 wrap', async () => {
    const d = validateLifeRun({ ...definition, seed: 4294967295 });
    const result = await compareSeeds(d, new AbortController().signal, () => {}, async () => {}, 20);
    expect(result.status).toBe('completed'); expect(result.seeds).toEqual([4294967295, 0, 1]);
    for (const run of result.runs) { let s = initializeLife(validateLifeRun({ ...d, seed: run.seed })); for (let i = 0; i < 20; i++) s = stepLife(s); expect(run.metrics).toEqual(lifeMetrics(s)); }
  });
  it('cancels between bounded chunks and preserves partial provenance', async () => {
    const abort = new AbortController();
    const result = await compareSeeds(definition, abort.signal, () => abort.abort(), async () => {});
    expect(result.status).toBe('cancelled'); expect(result.runs).toHaveLength(1); expect(result.runs[0]!.metrics.tick).toBe(4);
    expect(result.runs[0]!.status).toBe('cancelled');
  });
});

it('matches independently generated Python fields, controllers, lineage and accounting', () => {
  for (const fixture of reference.cases) {
    let s = initializeLife(validateLifeRun({ ...definition, rules: { ...definition.rules, boundary: fixture.boundary } }));
    for (const frame of fixture.frames) {
      while (s.tick < frame.tick) s = stepLife(s);
      expect({ tick: s.tick, field: Array.from(s.field), organisms: s.organisms, lineage: s.lineage, rngState: s.rngState, dissipated: s.dissipated }).toEqual(frame);
    }
  }
});

it('matches the published JSON schema on supported and rejected definitions', async () => {
  const { default: Ajv } = await import('ajv');
  const { default: schema } = await import('../schemas/life-run.schema.json');
  const valid = new Ajv().compile(schema);
  for (const candidate of [definition, { ...definition, genesis: { ...definition.genesis, mode: 'primordial' } }, { ...definition, rules: { ...definition.rules, extra: true } }, { ...definition, universe: { width: 65, height: 8 } }]) {
    let accepted = true; try { validateLifeRun(candidate); } catch { accepted = false; }
    expect(valid(candidate)).toBe(accepted);
  }
});
