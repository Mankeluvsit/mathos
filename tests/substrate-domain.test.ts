import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';
import example from '../examples/substrate-run.v1.json';
import schema from '../schemas/substrate-run.schema.json';
import { DEFAULT_EXPERIMENT } from '../src/domain/experiment';
import { parseSubstrateRun, serializeSubstrateRun, substrateFromExperiment, validateSubstrateRun } from '../src/domain/substrate-run';
import { loadSubstrate, saveSubstrate, SUBSTRATE_KEY } from '../src/storage/substrate-storage';
import { STORAGE_KEY } from '../src/storage/experiment-storage';

const validate = new Ajv().compile(schema);
describe('substrate definitions', () => {
  it('round-trips its separate format and freezes a canonical copy', () => {
    const value = validateSubstrateRun(example);
    expect(parseSubstrateRun(serializeSubstrateRun(value))).toEqual(example);
    expect(value.universe).not.toBe(example.universe);
    expect(Object.isFrozen(value.rules)).toBe(true);
    expect(substrateFromExperiment(DEFAULT_EXPERIMENT).seed).toBe(42);
    expect(() => parseSubstrateRun(JSON.stringify(DEFAULT_EXPERIMENT))).toThrow();
  });
  const cases = [example, null, [], { ...example, schemaVersion: 2 }, { ...example, format: 'mathos-experiment' },
    { ...example, name: ' ' }, { ...example, seed: -1 }, { ...example, seed: 4294967296 },
    { ...example, universe: { width: 7, height: 8 } }, { ...example, extra: true },
    { ...example, engine: { id: 'unknown', version: 1 } }, { ...example, rng: { id: 'mulberry32', version: 2 } },
    { ...example, initializer: { id: ['uniform-noise'], version: 1 } },
    { ...example, rules: { ...example.rules, boundary: ['periodic'] } },
    { ...example, rules: { ...example.rules, transferDivisor: 4 } },
    { ...example, rules: { ...example.rules, extra: 1 } },
    { ...example, seed: 0, initializer: { id: 'center-impulse', version: 1 } },
    { ...example, seed: 4294967295, rules: { ...example.rules, boundary: 'closed', transferDivisor: 16 } },
  ];
  it.each(cases.map((value, i) => [i, value] as const))('agrees with JSON Schema for case %i', (_i, value) => {
    if (validate(value)) expect(() => validateSubstrateRun(value)).not.toThrow();
    else expect(() => validateSubstrateRun(value)).toThrow();
  });
  it('rejects malformed, oversized and non-finite inputs', () => {
    expect(() => parseSubstrateRun('{')).toThrow('not valid JSON');
    expect(() => parseSubstrateRun(' '.repeat(65537))).toThrow('64 KiB');
    expect(() => validateSubstrateRun({ ...example, seed: NaN })).toThrow();
  });
  it('keeps the old storage slot and invalid saved data intact', () => {
    const run = validateSubstrateRun(example);
    localStorage.setItem(STORAGE_KEY, 'original v1');
    saveSubstrate(localStorage, run);
    expect(loadSubstrate(localStorage)).toEqual(run);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('original v1');
    localStorage.setItem(SUBSTRATE_KEY, '{broken');
    expect(() => loadSubstrate(localStorage)).toThrow();
    expect(localStorage.getItem(SUBSTRATE_KEY)).toBe('{broken');
    expect(() => saveSubstrate(localStorage, { ...run, seed: -1 })).toThrow();
    expect(localStorage.getItem(SUBSTRATE_KEY)).toBe('{broken');
  });
  it('surfaces missing data and blocked/quota failures', () => {
    expect(() => loadSubstrate(localStorage)).toThrow('No substrate');
    const storage = { getItem: vi.fn(() => { throw Error('blocked'); }), setItem: vi.fn(() => { throw Error('quota'); }) };
    expect(() => loadSubstrate(storage)).toThrow('Import/export');
    expect(() => saveSubstrate(storage, validateSubstrateRun(example))).toThrow('Export');
  });
});
