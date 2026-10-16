import { validateLifeRun, type LifeRun } from '../domain/life-run.ts';
import { initializeLife, stepLife, lifeMetrics, type LifeState } from './engine.ts';
export interface BatchResult {
  format: 'mathos-life-results'; schemaVersion: 1; definition: LifeRun; seeds: number[]; ticksPerSeed: number;
  status: 'completed' | 'cancelled' | 'failed'; reason: string;
  runs: Array<{ seed: number; status: 'completed' | 'cancelled' | 'failed'; metrics: ReturnType<typeof lifeMetrics> }>;
}
/** An explicit local three-seed comparison, yielding after at most four ticks. */
export async function compareSeeds(input: LifeRun, signal: AbortSignal, progress: (tick: number, seed: number) => void,
  yieldWork: () => Promise<void> = () => new Promise(resolve => setTimeout(resolve, 0)), ticks = 500): Promise<BatchResult> {
  const definition = validateLifeRun(input);
  if (!Number.isInteger(ticks) || ticks < 1 || ticks > 500) throw Error('Comparison tick limit must be 1–500.');
  const seeds = [definition.seed, (definition.seed + 1) >>> 0, (definition.seed + 2) >>> 0];
  const result: BatchResult = { format: 'mathos-life-results', schemaVersion: 1, definition, seeds, ticksPerSeed: ticks, status: 'completed', reason: 'tick-limit', runs: [] };
  let active: LifeState | undefined;
  try {
    for (const seed of seeds) {
      if (signal.aborted) break;
      active = initializeLife(validateLifeRun({ ...definition, seed }));
      while (active.tick < ticks && !signal.aborted) {
        for (let i = 0; i < 4 && active.tick < ticks && !signal.aborted; i++) active = stepLife(active);
        progress(active.tick, seed); await yieldWork();
      }
      result.runs.push({ seed, status: signal.aborted ? 'cancelled' : 'completed', metrics: lifeMetrics(active) }); active = undefined;
      if (signal.aborted) break;
    }
    if (signal.aborted) { result.status = 'cancelled'; result.reason = 'cancelled-by-user-or-hidden-tab'; }
  } catch (cause) {
    result.status = 'failed'; result.reason = cause instanceof Error ? cause.message : 'Engine failed.';
    if (active) result.runs.push({ seed: active.definition.seed, status: 'failed', metrics: lifeMetrics(active) });
  }
  return result;
}
