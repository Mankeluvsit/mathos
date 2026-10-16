import { MAX_IMPORT_BYTES, validateExperiment, type Experiment } from './experiment.ts';

export interface SubstrateRun {
  readonly format: 'mathos-substrate-run';
  readonly schemaVersion: 1;
  readonly name: string;
  readonly seed: number;
  readonly universe: Readonly<{ width: number; height: number }>;
  readonly engine: Readonly<{ id: 'substrate-reference'; version: 1 }>;
  readonly rng: Readonly<{ id: 'mulberry32'; version: 1 }>;
  readonly initializer: Readonly<{ id: 'uniform-noise' | 'center-impulse'; version: 1 }>;
  readonly rules: Readonly<{
    id: 'conservative-transport'; version: 1;
    boundary: 'periodic' | 'closed'; transferDivisor: 8 | 16;
  }>;
}

function exact(value: unknown, keys: string[]): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)
    || Object.keys(value).length !== keys.length || !keys.every((key) => Object.hasOwn(value, key))) {
    throw new Error('Substrate definition must contain exactly the documented fields.');
  }
}

export function validateSubstrateRun(value: unknown): SubstrateRun {
  exact(value, ['format', 'schemaVersion', 'name', 'seed', 'universe', 'engine', 'rng', 'initializer', 'rules']);
  if (value.format !== 'mathos-substrate-run' || value.schemaVersion !== 1) {
    throw new Error('Unsupported substrate format or version. Expected mathos-substrate-run v1.');
  }
  // Reuse the established name/seed/grid contract; this does not execute genesis.
  const common = validateExperiment({ format: 'mathos-experiment', schemaVersion: 1,
    name: value.name, seed: value.seed, universe: value.universe, genesis: { mode: 'primordial' } });
  exact(value.engine, ['id', 'version']); exact(value.rng, ['id', 'version']);
  exact(value.initializer, ['id', 'version']);
  exact(value.rules, ['id', 'version', 'boundary', 'transferDivisor']);
  if (value.engine.id !== 'substrate-reference' || value.engine.version !== 1
    || value.rng.id !== 'mulberry32' || value.rng.version !== 1
    || value.initializer.version !== 1 || (value.initializer.id !== 'uniform-noise' && value.initializer.id !== 'center-impulse')
    || value.rules.id !== 'conservative-transport' || value.rules.version !== 1
    || (value.rules.boundary !== 'periodic' && value.rules.boundary !== 'closed')
    || (value.rules.transferDivisor !== 8 && value.rules.transferDivisor !== 16)) {
    throw new Error('Unsupported substrate algorithm, version, boundary, or transfer divisor.');
  }
  return Object.freeze({
    format: 'mathos-substrate-run', schemaVersion: 1, name: common.name, seed: common.seed,
    universe: Object.freeze({ ...common.universe }),
    engine: Object.freeze({ id: 'substrate-reference', version: 1 }),
    rng: Object.freeze({ id: 'mulberry32', version: 1 }),
    initializer: Object.freeze({ id: value.initializer.id as SubstrateRun['initializer']['id'], version: 1 }),
    rules: Object.freeze({ id: 'conservative-transport', version: 1,
      boundary: value.rules.boundary as SubstrateRun['rules']['boundary'], transferDivisor: value.rules.transferDivisor }),
  });
}

export function substrateFromExperiment(experiment: Experiment): SubstrateRun {
  const common = validateExperiment(experiment);
  return validateSubstrateRun({ format: 'mathos-substrate-run', schemaVersion: 1,
    name: common.name, seed: common.seed, universe: common.universe,
    engine: { id: 'substrate-reference', version: 1 }, rng: { id: 'mulberry32', version: 1 },
    initializer: { id: 'uniform-noise', version: 1 },
    rules: { id: 'conservative-transport', version: 1, boundary: 'periodic', transferDivisor: 8 } });
}

export function parseSubstrateRun(text: string): SubstrateRun {
  if (new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES) throw new Error('Substrate file exceeds the 64 KiB limit.');
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error('Substrate definition is not valid JSON.'); }
  return validateSubstrateRun(value);
}

export function serializeSubstrateRun(value: unknown): string {
  return `${JSON.stringify(validateSubstrateRun(value), null, 2)}\n`;
}
