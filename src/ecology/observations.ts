import { copy as copyGenome, type World as GenomeWorld } from "./genome-model.ts";
import { ecologyMetrics } from "./world.ts";
import { copy as copyLearning, type World as LearningWorld } from "./learning-model.ts";
import { copy, type World } from "./oriented-model.ts";
/** Measured observations only: intentionally not a checkpoint or resume format. */
export function exportObservations(world: World | LearningWorld | GenomeWorld) {
  const s = world.definition.version === 4 ? copyGenome(world as GenomeWorld) : world.definition.version === 3 ? copyLearning(world as LearningWorld) : copy(world as World);
  return {
    format: "mathos-ecology-observations",
    version: s.definition.version === 4 ? 3 : s.definition.version === 3 ? 2 : 1,
    engine: `ecology-reference@${s.definition.version}`,
    ...(s.definition.version >= 3 ? { controller: "linear-td@1", streams: "ecology-streams@1", learning: (s as LearningWorld | GenomeWorld).definition.learning } : {}),
    ...(s.definition.version === 4 ? {bodyGenome: "cell-layout@1", historyCategories: "founder-template origins"} : {}),
    rng: "mulberry32@1",
    definition: s.definition,
    tick: s.tick,
    reason: s.tick === 1600 ? "tick-limit" : "sampled",
    metrics: ecologyMetrics(s),
    history: s.history,
    lineage: s.lineage,
  };
}
