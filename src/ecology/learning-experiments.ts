import { initialize, step, validate, END, type World } from './learning-model.ts';
import { ecologyMetrics } from './world.ts';
import { BASELINE_SEEDS } from './baseline.ts';

export interface Measurements {
  definition: World['definition'];
  status: 'completed' | 'cancelled' | 'failed';
  ticks: number;
  populationTicks: number;
  peakPopulation: number;
  firstExtinctionTick: number | null;
  totalIntake: number;
  updates: number;
  computeMs: number;
  metrics: ReturnType<typeof ecologyMetrics>;
}
export interface Comparison {
  format: 'mathos-learning-comparison';
  version: 1;
  engine: 'ecology-reference@3';
  controller: 'linear-td@1';
  rng: 'mulberry32@1';
  streams: 'ecology-streams@1';
  source: { revision: string; dirty: boolean };
  seeds: number[];
  ticksPerRun: number;
  status: 'completed' | 'cancelled' | 'failed';
  reason: string;
  runs: Measurements[];
}

/** Twelve bounded worlds, independent of the interactive world. Never edits the seed list. */
export async function compareLearning(
  source: Comparison['source'], signal: AbortSignal,
  progress: (completed: number, total: number) => void,
  yieldWork: () => Promise<void> = () => new Promise(resolve => setTimeout(resolve, 0)),
  ticks = END,
): Promise<Comparison> {
  if (!Number.isInteger(ticks) || ticks < 1 || ticks > END) throw Error('Comparison horizon must be 1–1600.');
  const result: Comparison = {
    format: 'mathos-learning-comparison', version: 1, engine: 'ecology-reference@3',
    controller: 'linear-td@1', rng: 'mulberry32@1', streams: 'ecology-streams@1',
    source: { ...source }, seeds: [...BASELINE_SEEDS], ticksPerRun: ticks,
    status: 'completed', reason: 'requested-horizon', runs: [],
  };
  let active: World | undefined, populationTicks = 0, peakPopulation = 0;
  let firstExtinctionTick: number | null = null, computeMs = 0;
  function record(status: Measurements['status']) {
    if (!active) return;
    result.runs.push({ definition: active.definition, status, ticks: active.tick,
      populationTicks, peakPopulation, firstExtinctionTick, computeMs,
      totalIntake: active.lineage.reduce((n, l) => n + l.intake, 0),
      updates: active.lineage.reduce((n, l) => n + l.updates, 0), metrics: ecologyMetrics(active) });
  }
  try {
    for (const seed of BASELINE_SEEDS) {
      for (const learning of [false, true]) {
        if (signal.aborted) break;
        active = initialize(validate({ format: 'mathos-ecology', version: 3, seed, mode: 'seeded', learning }));
        populationTicks = 0; peakPopulation = active.creatures.length; firstExtinctionTick = null; computeMs = 0;
        while (active.tick < ticks && !signal.aborted) {
          const start = performance.now();
          let count = 0;
          while (count < 4 && active.tick < ticks && !signal.aborted) {
            active = step(active); count++;
            populationTicks += active.creatures.length;
            peakPopulation = Math.max(peakPopulation, active.creatures.length);
            if (!active.creatures.length && firstExtinctionTick === null) firstExtinctionTick = active.tick;
            if (performance.now() - start >= 8) break;
          }
          computeMs += performance.now() - start;
          progress(result.runs.length * ticks + active.tick, BASELINE_SEEDS.length * 2 * ticks);
          await yieldWork();
        }
        record(signal.aborted ? 'cancelled' : 'completed'); active = undefined;
      }
      if (signal.aborted) break;
    }
    if (signal.aborted) { result.status = 'cancelled'; result.reason = 'cancelled-by-user-or-hidden-tab'; }
  } catch (e) {
    record('failed'); result.status = 'failed'; result.reason = e instanceof Error ? e.message : 'Comparison failed.';
  }
  return result;
}

/** Only completed pairs can support differences. Keep null for missing/partial arms. */
export function pairedDifferences(result: Comparison) {
  return result.seeds.map(seed => {
    const off = result.runs.find(r => r.definition.seed === seed && !r.definition.learning && r.status === 'completed');
    const on = result.runs.find(r => r.definition.seed === seed && r.definition.learning && r.status === 'completed');
    return { seed, off, on, difference: off && on ? {
      survivors: on.metrics.population - off.metrics.population,
      births: on.metrics.births - off.metrics.births, deaths: on.metrics.deaths - off.metrics.deaths,
      populationTicks: on.populationTicks - off.populationTicks,
      totalIntake: on.totalIntake - off.totalIntake,
      computeMs: on.computeMs - off.computeMs,
    } : null };
  });
}
