/** Isolated linear-td@1 arithmetic. Not connected to an ecology world yet.
 * Contract: docs/decisions/0010-bounded-lifetime-learning.md.
 */
import { nextRandom } from '../simulation/rng.ts';

export const CONTROLLER_VERSION = 'linear-td@1';
export const STREAM_VERSION = 'ecology-streams@1';
export const MAX_UPDATES = 1600;
export interface Controller {
  readonly weights: readonly (readonly number[])[];
  readonly updates: number;
}
export interface Transition {
  readonly input: readonly number[];
  readonly action: number;
  readonly reward: number;
  /** Null means death or the final permitted world tick; do not bootstrap. */
  readonly nextInput: readonly number[] | null;
  readonly enabled: boolean;
}

function integer(value: number, min: number, max: number, label: string) {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw Error(`${label} must be an integer from ${min} to ${max}.`);
  }
}
function vector(value: readonly number[], size: number, min: number, max: number, label: string) {
  if (!Array.isArray(value) || value.length !== size) throw Error(`${label} must have ${size} entries.`);
  for (const n of value) integer(n, min, max, label);
}
function features(input: readonly number[]) {
  vector(input, 6, 0, 64, 'Features');
  if (input[0] !== 64) throw Error('Bias feature must equal 64.');
}
function assertController(c: Controller) {
  if (!c || !Array.isArray(c.weights) || c.weights.length !== 4) throw Error('Expected four weight rows.');
  for (const row of c.weights) vector(row, 6, -4096, 4096, 'Weights');
  integer(c.updates, 0, MAX_UPDATES, 'Update count');
}
const clamp = (n: number, bound: number) => Math.max(-bound, Math.min(bound, n));
// Negative fractional results must be +0, not JS's observable -0.
const trunc = (n: number) => Math.trunc(n) || 0;

export function observe(signals: readonly number[], energy: number): number[] {
  vector(signals, 4, 0, Number.MAX_SAFE_INTEGER, 'Food signals');
  integer(energy, 0, 600, 'Stored energy');
  return [64, ...signals.map((n) => Math.floor(Math.min(n, 1024) / 16)), Math.floor(64 * energy / 600)];
}

/** Call for each founder/newborn using its own inherited genes. */
export function createController(foodWeight: number, inertia: number): Controller {
  integer(foodWeight, 1, 6, 'Inherited food weight');
  integer(inertia, 0, 6, 'Inherited inertia');
  const weights = Array.from({ length: 4 }, () => Array<number>(6).fill(0));
  for (let a = 0; a < 4; a++) weights[a]![a + 1] = 256 * foodWeight;
  weights[0]![0] = 16 * inertia;
  return { weights, updates: 0 };
}

function values(c: Controller, input: readonly number[]): number[] {
  return c.weights.map((row) => trunc(row.reduce((sum, w, j) => sum + w * input[j]!, 0) / 64));
}
export function actionValues(c: Controller, input: readonly number[]): number[] {
  assertController(c);
  features(input);
  return values(c, input);
}

export function deriveStreams(seed: number, id: number) {
  integer(seed, 0, 4294967295, 'Seed');
  integer(id, 1, 256, 'Organism ID');
  return {
    environment: seed,
    reproduction: (seed ^ 0xA341316C) >>> 0,
    exploration: (seed ^ 0xC8013EA4 ^ Math.imul(id, 0x9E3779B9)) >>> 0,
  };
}

/** Exactly two words per eligible decision, including non-exploration choices. */
export function chooseAction(c: Controller, input: readonly number[], rngState: number) {
  integer(rngState, 0, 4294967295, 'Exploration RNG state');
  const scores = actionValues(c, input);
  const gate = nextRandom(rngState);
  const choice = nextRandom(gate.state);
  const exploring = gate.value % 16 === 0;
  return {
    action: exploring ? choice.value % 4 : scores.indexOf(Math.max(...scores)),
    scores,
    exploring,
    rngState: choice.state,
  };
}

/** Physical accounting is performed by the future engine, never this helper. */
export function measuredReward(intake: number, mechanicalCost: number, upkeep: number): number {
  integer(intake, 0, 48, 'Actual intake');
  integer(mechanicalCost, 0, 3, 'Actual mechanical cost');
  integer(upkeep, 0, 4, 'Actual upkeep');
  return clamp(intake - mechanicalCost - upkeep, 32);
}

/** Complete one already observed eligible transition; never mutate its inputs. */
export function learn(c: Controller, event: Transition) {
  assertController(c);
  features(event.input);
  integer(event.action, 0, 3, 'Selected action');
  integer(event.reward, -32, 32, 'Reward');
  if (typeof event.enabled !== 'boolean') throw Error('Learning enabled must be a boolean.');
  if (event.nextInput !== null) features(event.nextInput);
  if (event.enabled && c.updates === MAX_UPDATES) throw Error('Controller update budget exhausted.');

  const previousQ = values(c, event.input)[event.action]!;
  const nextQ = event.nextInput === null ? 0 : Math.max(...values(c, event.nextInput));
  const delta = clamp(256 * event.reward + trunc(3 * nextQ / 4) - previousQ, 16384);
  const weights = c.weights.map((row) => [...row]);
  const selected = weights[event.action]!;
  if (event.enabled) {
    for (let j = 0; j < 6; j++) {
      selected[j] = clamp(selected[j]! + trunc(delta * event.input[j]! / 4096), 4096);
    }
  }
  return {
    controller: { weights, updates: c.updates + Number(event.enabled) },
    previousQ,
    nextQ,
    delta,
    changes: selected.map((w, j) => w - c.weights[event.action]![j]!),
    updated: event.enabled,
  };
}
