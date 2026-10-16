import { transport } from './transport.ts';
import { measure } from './metrics.ts';
import { MAX_TICKS, type WorldState } from './state.ts';

export function step(state: WorldState): WorldState {
  if (!Number.isInteger(state.tick) || state.tick < 0 || state.tick >= MAX_TICKS) throw new Error('Tick limit reached or invalid tick.');
  const { width, height } = state.definition.universe;
  if (state.field.length !== width * height) throw new Error('Field dimensions invariant failed.');
  const field = transport(state.field, width, height, state.definition.rules);
  const metrics = measure(field);
  if (metrics.sum !== state.metrics.sum) throw new Error('Resource conservation invariant failed.');
  return { ...state, tick: state.tick + 1, field, metrics };
}
