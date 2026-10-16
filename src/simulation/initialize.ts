import { validateSubstrateRun } from '../domain/substrate-run.ts';
import { nextRandom } from './rng.ts';
import { measure } from './metrics.ts';
import type { WorldState } from './state.ts';

export function initialize(value: unknown): WorldState {
  const definition = validateSubstrateRun(value);
  const { width, height } = definition.universe;
  const field = new Uint16Array(width * height);
  let rngState = definition.seed;
  if (definition.initializer.id === 'uniform-noise') {
    for (let i = 0; i < field.length; i++) {
      const draw = nextRandom(rngState); rngState = draw.state; field[i] = draw.value >>> 16;
    }
  } else { field[Math.floor(height / 2) * width + Math.floor(width / 2)] = 65535; }
  return { definition, tick: 0, rngState, field, metrics: measure(field) };
}
