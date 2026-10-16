import { MAX_IMPORT_BYTES, validateExperiment, type Experiment } from './experiment.ts';

export interface LifeRun {
  readonly format: 'mathos-life-run'; readonly schemaVersion: 1;
  readonly name: string; readonly seed: number;
  readonly universe: Readonly<{ width: number; height: number }>;
  readonly engine: 'life-reference@1'; readonly rng: 'mulberry32@1';
  readonly genesis: Readonly<{ mode: 'primordial' | 'seeded'; recipe: 'resource-noise@1'; template: 'center-cell@1' }>;
  readonly rules: Readonly<{ id: 'pixel-life@1'; boundary: 'closed' | 'periodic'; transferDivisor: 8 | 16 }>;
}
function exact(v: unknown, keys: string[]): asserts v is Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v) || Object.keys(v).length !== keys.length || !keys.every(k => Object.hasOwn(v, k))) throw Error('Life definition must contain exactly the documented fields.');
}
export function validateLifeRun(v: unknown): LifeRun {
  exact(v, ['format', 'schemaVersion', 'name', 'seed', 'universe', 'engine', 'rng', 'genesis', 'rules']);
  exact(v.genesis, ['mode', 'recipe', 'template']); exact(v.rules, ['id', 'boundary', 'transferDivisor']);
  const common = validateExperiment({ format: 'mathos-experiment', schemaVersion: 1, name: v.name, seed: v.seed, universe: v.universe, genesis: { mode: v.genesis.mode } });
  if (v.format !== 'mathos-life-run' || v.schemaVersion !== 1 || v.engine !== 'life-reference@1' || v.rng !== 'mulberry32@1'
    || v.genesis.recipe !== 'resource-noise@1' || v.genesis.template !== 'center-cell@1'
    || v.rules.id !== 'pixel-life@1' || (v.rules.boundary !== 'closed' && v.rules.boundary !== 'periodic') || ![8, 16].includes(v.rules.transferDivisor as number)) throw Error('Unsupported life format, version or rule.');
  if (common.universe.width > 64 || common.universe.height > 64) throw Error('Life baseline dimensions must be 8–64 pixels per side.');
  return Object.freeze({ format: 'mathos-life-run', schemaVersion: 1, name: common.name, seed: common.seed,
    universe: Object.freeze({ ...common.universe }), engine: 'life-reference@1', rng: 'mulberry32@1',
    genesis: Object.freeze({ mode: common.genesis.mode, recipe: 'resource-noise@1', template: 'center-cell@1' }),
    rules: Object.freeze({ id: 'pixel-life@1', boundary: v.rules.boundary as 'closed' | 'periodic', transferDivisor: v.rules.transferDivisor as 8 | 16 }) });
}
export function lifeFromExperiment(e: Experiment): LifeRun {
  return validateLifeRun({ format: 'mathos-life-run', schemaVersion: 1, name: e.name, seed: e.seed, universe: e.universe,
    engine: 'life-reference@1', rng: 'mulberry32@1', genesis: { mode: e.genesis.mode, recipe: 'resource-noise@1', template: 'center-cell@1' },
    rules: { id: 'pixel-life@1', boundary: 'periodic', transferDivisor: 8 } });
}
export function parseLifeRun(text: string): LifeRun {
  if (new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES) throw Error('Life definition exceeds 64 KiB.');
  let v: unknown; try { v = JSON.parse(text); } catch { throw Error('Invalid life JSON.'); } return validateLifeRun(v);
}
export function serializeLifeRun(v: unknown) { return JSON.stringify(validateLifeRun(v), null, 2) + '\n'; }
