/** Bounded measurements of the unchanged v2 controller, for future learning comparisons. */
import { initialize, step, END } from './oriented-model.ts';
import { ecologyMetrics } from './world.ts';

export const BASELINE_SEEDS = Object.freeze([0, 1, 2, 42, 123456789, 4294967295]);

export function measureBaseline(seed: number, ticks = END) {
  if (!Number.isInteger(ticks) || ticks < 1 || ticks > END) {
    throw Error(`Measurement horizon must be an integer from 1 to ${END}.`);
  }
  let world = initialize({ format: 'mathos-ecology', version: 2, seed, mode: 'seeded' });
  let peakPopulation = world.creatures.length;
  let populationTicks = 0;
  let firstExtinctionTick: number | null = null;
  for (let tick = 0; tick < ticks; tick++) {
    world = step(world);
    populationTicks += world.creatures.length;
    peakPopulation = Math.max(peakPopulation, world.creatures.length);
    if (!world.creatures.length && firstExtinctionTick === null) firstExtinctionTick = world.tick;
  }
  return {
    definition: world.definition,
    ticks: world.tick,
    termination: world.tick === END ? 'tick-limit' : 'requested-horizon',
    peakPopulation,
    populationTicks,
    firstExtinctionTick,
    totalIntake: world.lineage.reduce((sum, ancestor) => sum + ancestor.intake, 0),
    metrics: ecologyMetrics(world),
  };
}
