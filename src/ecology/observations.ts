import { ecologyMetrics } from "./world.ts";
import { copy, type World } from "./oriented-model.ts";
/** Measured observations only: intentionally not a checkpoint or resume format. */
export function exportObservations(world: World) {
  const s = copy(world);
  return {
    format: "mathos-ecology-observations",
    version: 1,
    engine: "ecology-reference@2",
    rng: "mulberry32@1",
    definition: s.definition,
    tick: s.tick,
    reason: s.tick === 1600 ? "tick-limit" : "sampled",
    metrics: ecologyMetrics(s),
    history: s.history,
    lineage: s.lineage,
  };
}
