/** Shadow-learning integration: consumes actual v2 ecology transitions without changing v2 decisions. */
import { initialize, step, type Definition, type World } from './oriented-model.ts';
import { choose, initialWeights, inputs, rewardFromOutcome, update, type Weights } from './learning-controller.ts';

export interface ShadowRecord {
  weights: Weights;
  updates: number;
  lastIntendedAction: number | null;
  lastObservedReward: number | null;
}
export interface ShadowRun {
  world: World;
  learning: boolean;
  records: Map<number, ShadowRecord>;
  totalUpdates: number;
}
/** Start from the exact v2 world; this is a diagnostic, NOT a v3 organism policy. */
export function startShadow(definition: Definition, learning: boolean): ShadowRun {
  const world = initialize(definition);
  return {
    world, learning, totalUpdates: 0,
    records: new Map(world.creatures.map(c => [c.id, {
      weights: initialWeights(c.genes.foodWeight, c.genes.inertia),
      updates: 0, lastIntendedAction: null, lastObservedReward: null,
    }])),
  };
}
export function advanceShadow(old: ShadowRun): ShadowRun {
  const world = step(old.world);
  const records = new Map<number, ShadowRecord>();
  let totalUpdates = old.totalUpdates;
  const before = new Map(old.world.creatures.map(c => [c.id, c]));
  const after = new Map(world.creatures.map(c => [c.id, c]));
  for (const [id, previous] of before) {
    const current = after.get(id);
    const oldRecord = old.records.get(id);
    if (!oldRecord) throw Error('Missing shadow record');
    const record: ShadowRecord = {
      weights: oldRecord.weights.map(row => [...row]),
      updates: oldRecord.updates,
      lastIntendedAction: null,
      lastObservedReward: null,
    };
    const hasMotor = previous.size >= 3;
    if (hasMotor) {
      const observation = inputs(previous.signals, previous.energy);
      const next = inputs(current?.signals ?? [0, 0, 0, 0], current?.energy ?? 0);
      const selected = choose(record.weights, observation);
      const intake = (current?.intake ?? world.lineage.find(l => l.id === id)?.intake ?? previous.intake) - previous.intake;
      const movement = (current?.distance ?? world.lineage.find(l => l.id === id)?.distance ?? previous.distance) - previous.distance;
      const turns = (current?.turns ?? world.lineage.find(l => l.id === id)?.turns ?? previous.turns) - previous.turns;
      // The v2 engine has no per-tick metabolism log. Recover actual metabolism from
      // energy flow for survivors, excluding development/reproduction; for deaths use
      // a bounded approximation and do not treat it as experimental reward evidence.
      if (current) {
        const structural = Math.max(0, current.size - previous.size) * 8;
        const birthCost = current.lastBirth !== previous.lastBirth ? 116 : 0;
        const actionCost = turns + movement * (2 + Math.max(0, previous.size - 3));
        const metabolism = Math.max(0, previous.energy + intake - actionCost - structural - birthCost - current.energy);
        const reward = rewardFromOutcome(intake, actionCost, Math.min(600, metabolism));
        const result = update(record.weights, observation, selected, reward, next, false, old.learning);
        record.weights = result.weights;
        record.updates += Number(result.updated);
        totalUpdates += Number(result.updated);
        record.lastIntendedAction = selected;
        record.lastObservedReward = reward;
      }
    }
    if (current) records.set(id, record);
  }
  for (const c of world.creatures) if (!records.has(c.id))
    records.set(c.id, {weights: initialWeights(c.genes.foodWeight, c.genes.inertia), updates: 0, lastIntendedAction: null, lastObservedReward: null});
  return {world, learning: old.learning, records, totalUpdates};
}
