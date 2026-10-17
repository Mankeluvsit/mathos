/** Experimental L2: pure deterministic bounded integer controller; not yet integrated into ecology v3. */
export const ACTIONS = 4;
export const INPUTS = 6;
export const WEIGHT_LIMIT = 4096;
export type Weights = number[][];
export type Observation = number[];
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
function integer(n: number, name: string) {
  if (!Number.isSafeInteger(n)) throw Error(`${name} must be a safe integer`);
  return n;
}
export function inputs(signals: number[], energy: number): Observation {
  if (!Array.isArray(signals) || signals.length !== 4) throw Error('Expected four relative food signals');
  integer(energy, 'energy');
  if (energy < 0 || energy > 600) throw Error('Energy out of range');
  return [64, ...signals.map(s => Math.floor(clamp(integer(s, 'signal'), 0, 1024) / 16)), Math.floor(64 * energy / 600)];
}
export function initialWeights(foodWeight: number, inertia: number): Weights {
  integer(foodWeight, 'foodWeight'); integer(inertia, 'inertia');
  if (foodWeight < 1 || foodWeight > 6 || inertia < 0 || inertia > 6) throw Error('Gene out of range');
  const weights: Weights = Array.from({length: ACTIONS}, () => Array(INPUTS).fill(0) as number[]);
  for (let action = 0; action < ACTIONS; action++) weights[action]![action + 1] = 256 * foodWeight;
  weights[0]![0] = 16 * inertia;
  return weights;
}
export function validateWeights(weights: Weights): void {
  if (!Array.isArray(weights) || weights.length !== ACTIONS ||
      weights.some(row => !Array.isArray(row) || row.length !== INPUTS ||
      row.some(w => !Number.isSafeInteger(w) || Math.abs(w) > WEIGHT_LIMIT))) throw Error('Invalid weights');
}
export function values(weights: Weights, observation: Observation): number[] {
  validateWeights(weights);
  if (!Array.isArray(observation) || observation.length !== INPUTS ||
      observation.some(x => !Number.isSafeInteger(x) || x < 0 || x > 64) ||
      observation[0] !== 64) throw Error('Invalid observation');
  return weights.map(row => Math.trunc(row.reduce((sum, w, j) => sum + w * observation[j]!, 0) / 64));
}
export function choose(weights: Weights, observation: Observation): number {
  const q = values(weights, observation);
  return q.indexOf(Math.max(...q));
}
/** Signed net energy flow observed in one tick; structural/reproductive costs excluded. */
export function rewardFromOutcome(intake: number, actionCost: number, metabolism: number): number {
  for (const [name, value] of [['intake', intake], ['actionCost', actionCost], ['metabolism', metabolism]] as const) {
    integer(value, name);
    if (value < 0 || value > 600) throw Error(name + ' out of range');
  }
  return clamp(intake - actionCost - metabolism, -32, 32);
}
export function update(weights: Weights, previousObservation: Observation, selectedAction: number, reward: number, nextObservation: Observation, terminal = false, enabled = true) {
  const oldQ = values(weights, previousObservation);
  integer(selectedAction, 'action'); integer(reward, 'reward');
  if (selectedAction < 0 || selectedAction >= ACTIONS || reward < -32 || reward > 32) throw Error('Action/reward out of range');
  const successor = values(weights, nextObservation);
  const nextQ = terminal ? 0 : Math.max(...successor);
  const delta = clamp(256 * reward + Math.trunc(3 * nextQ / 4) - oldQ[selectedAction]!, -16384, 16384);
  const result = weights.map(row => [...row]);
  if (enabled) for (let j = 0; j < INPUTS; j++)
    result[selectedAction]![j] = clamp(result[selectedAction]![j]! + Math.trunc(delta * previousObservation[j]! / 4096), -WEIGHT_LIMIT, WEIGHT_LIMIT);
  return {weights: result, delta: enabled ? delta : 0, updated: enabled};
}
