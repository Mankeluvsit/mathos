import type { SubstrateRun } from '../domain/substrate-run.ts';
import type { Metrics } from './metrics.ts';

/** Internal engine state. Runtime snapshots copy the field before exposing it. */
export interface WorldState {
  readonly definition: SubstrateRun;
  readonly tick: number;
  readonly rngState: number;
  readonly field: Uint16Array;
  readonly metrics: Metrics;
}

export const MAX_TICKS = 10_000;
