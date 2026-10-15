export interface Experiment {
  format: 'mathos-experiment';
  schemaVersion: 1;
  name: string;
  seed: number;
  universe: { width: number; height: number };
  genesis: { mode: 'primordial' | 'seeded' };
}

export const MAX_IMPORT_BYTES = 64 * 1024;

export const DEFAULT_EXPERIMENT: Experiment = {
  format: 'mathos-experiment',
  schemaVersion: 1,
  name: 'First universe',
  seed: 42,
  universe: { width: 64, height: 64 },
  genesis: { mode: 'primordial' },
};

function objectWithKeys(value: unknown, keys: string[]): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    && Object.keys(value).length === keys.length
    && keys.every((key) => Object.hasOwn(value, key));
}

function integer(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

export function validateExperiment(value: unknown): Experiment {
  if (!objectWithKeys(value, ['format', 'schemaVersion', 'name', 'seed', 'universe', 'genesis'])) {
    throw new Error('Configuration must contain exactly the documented v1 fields.');
  }
  if (value.format !== 'mathos-experiment' || value.schemaVersion !== 1) {
    throw new Error('Unsupported configuration format or version. Expected mathos-experiment v1.');
  }
  if (typeof value.name !== 'string' || !value.name.trim() || [...value.name].length > 80) {
    throw new Error('Experiment name must contain 1–80 characters and cannot be blank.');
  }
  if (!integer(value.seed, 0, 4294967295)) {
    throw new Error('Random seed must be a whole number from 0 to 4294967295.');
  }
  if (!objectWithKeys(value.universe, ['width', 'height'])
    || !integer(value.universe.width, 8, 256) || !integer(value.universe.height, 8, 256)) {
    throw new Error('Width and height must be whole numbers from 8 to 256 pixels.');
  }
  if (!objectWithKeys(value.genesis, ['mode'])
    || (value.genesis.mode !== 'primordial' && value.genesis.mode !== 'seeded')) {
    throw new Error('Genesis mode must be primordial or seeded.');
  }
  return {
    format: 'mathos-experiment', schemaVersion: 1,
    name: value.name, seed: value.seed,
    universe: { width: value.universe.width, height: value.universe.height },
    genesis: { mode: value.genesis.mode },
  };
}

export function parseExperiment(text: string): Experiment {
  if (new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES) {
    throw new Error('Configuration file exceeds the 64 KiB limit.');
  }
  let value: unknown;
  try { value = JSON.parse(text); }
  catch { throw new Error('Configuration is not valid JSON.'); }
  return validateExperiment(value);
}

export function serializeExperiment(value: unknown): string {
  return `${JSON.stringify(validateExperiment(value), null, 2)}\n`;
}
