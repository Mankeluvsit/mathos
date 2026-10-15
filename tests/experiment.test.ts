import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';
import schema from '../schemas/experiment.schema.json';
import example from '../examples/experiment.v1.json';
import { DEFAULT_EXPERIMENT, MAX_IMPORT_BYTES, parseExperiment, serializeExperiment, validateExperiment } from '../src/domain/experiment';

const validateSchema = new Ajv({ allErrors: true }).compile(schema);

describe('configuration contract', () => {
  it('round-trips the documented example without sharing nested objects', () => {
    const value = validateExperiment(example);
    expect(parseExperiment(serializeExperiment(value))).toEqual(example);
    expect(value.universe).not.toBe(example.universe);
    expect(validateSchema(example)).toBe(true);
  });

  const cases: [string, unknown, boolean][] = [
    ['null', null, false],
    ['array', [], false],
    ['wrong format', { ...example, format: 'other' }, false],
    ['future version', { ...example, schemaVersion: 2 }, false],
    ['unknown property', { ...example, controller: {} }, false],
    ['nested unknown property', { ...example, universe: { ...example.universe, depth: 3 } }, false],
    ['empty name', { ...example, name: '' }, false],
    ['blank name', { ...example, name: ' \n\t' }, false],
    ['long name', { ...example, name: 'x'.repeat(81) }, false],
    ['Unicode name boundary', { ...example, name: '🌱'.repeat(80) }, true],
    ['negative seed', { ...example, seed: -1 }, false],
    ['large seed', { ...example, seed: 4294967296 }, false],
    ['fractional seed', { ...example, seed: 0.5 }, false],
    ['string seed', { ...example, seed: '42' }, false],
    ['zero seed', { ...example, seed: 0 }, true],
    ['maximum seed', { ...example, seed: 4294967295 }, true],
    ['small width', { ...example, universe: { width: 7, height: 64 } }, false],
    ['large height', { ...example, universe: { width: 64, height: 257 } }, false],
    ['fractional width', { ...example, universe: { width: 8.5, height: 64 } }, false],
    ['minimum dimensions', { ...example, universe: { width: 8, height: 8 } }, true],
    ['maximum dimensions', { ...example, universe: { width: 256, height: 256 } }, true],
    ['missing genesis', { ...example, genesis: {} }, false],
    ['unknown mode', { ...example, genesis: { mode: 'random' } }, false],
    ['seeded intent', { ...example, genesis: { mode: 'seeded' } }, true],
  ];
  it.each(cases)('runtime and schema agree: %s', (_name, value, valid) => {
    expect(validateSchema(value)).toBe(valid);
    if (valid) expect(() => validateExperiment(value)).not.toThrow();
    else expect(() => validateExperiment(value)).toThrow();
  });

  it('rejects non-finite numbers and malformed/oversized input', () => {
    for (const seed of [NaN, Infinity, -Infinity]) {
      expect(() => validateExperiment({ ...DEFAULT_EXPERIMENT, seed })).toThrow();
    }
    expect(() => parseExperiment('{')).toThrow('not valid JSON');
    expect(() => parseExperiment(' '.repeat(MAX_IMPORT_BYTES + 1))).toThrow('64 KiB');
    expect(() => parseExperiment('🌱'.repeat(MAX_IMPORT_BYTES / 3))).toThrow('64 KiB');
  });
});
