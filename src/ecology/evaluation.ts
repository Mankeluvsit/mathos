/** Developer evaluation only; no changes to model rules or the interactive runner. */
import * as model from './genome-model.ts';
import { ecologyMetrics } from './world.ts';
import { layoutKey } from './body-genome.ts';

export interface EvaluationPlan {
  format: 'mathos-ecology-evaluation-plan';
  version: 1;
  id: string;
  engine: 'ecology-reference@4';
  mode: 'seeded';
  ticksPerRun: number;
  seeds: readonly number[];
}

export function validateEvaluationPlan(input: unknown): Readonly<EvaluationPlan> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Expected an evaluation plan.');
  const p = input as Record<string, unknown>;
  const keys = ['format', 'version', 'id', 'engine', 'mode', 'ticksPerRun', 'seeds'];
  if (Object.keys(p).length !== keys.length || keys.some(key => !Object.hasOwn(p, key)) ||
      p.format !== 'mathos-ecology-evaluation-plan' || p.version !== 1 ||
      p.engine !== 'ecology-reference@4' || p.mode !== 'seeded' ||
      typeof p.id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(p.id)) throw Error('Unsupported evaluation plan.');
  if (!Number.isInteger(p.ticksPerRun) || (p.ticksPerRun as number) < 1 || (p.ticksPerRun as number) > model.END)
    throw Error('Evaluation horizon must be1–1600.');
  if (!Array.isArray(p.seeds) || p.seeds.length < 1 || p.seeds.length > 8 ||
      p.seeds.some(seed => !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) ||
      new Set(p.seeds).size !== p.seeds.length) throw Error('Use1–8 unique uint32 seeds.');
  return Object.freeze({format: 'mathos-ecology-evaluation-plan', version: 1, id: p.id,
    engine: 'ecology-reference@4', mode: 'seeded', ticksPerRun: p.ticksPerRun as number,
    seeds: Object.freeze([...p.seeds] as number[])});
}

export interface EvaluationRun {
  definition: model.Definition;
  status: 'completed' | 'cancelled' | 'failed';
  reason: string;
  ticks: number;
  populationTicks: number;
  peakPopulation: number;
  firstExtinctionTick: number | null;
  totalIntake: number;
  updates: number;
  enabledProposals: number;
  acceptedChanges: number;
  maxGenome: number;
  maxDeveloped: number;
  distinctBirthGenomes: number;
  metrics: ReturnType<typeof ecologyMetrics>;
}

export interface EvaluationResult {
  format: 'mathos-ecology-evaluation';
  version: 1;
  engine: 'ecology-reference@4';
  bodyGenome: 'cell-layout@1';
  controller: 'linear-td@1';
  rng: 'mulberry32@1';
  streams: 'ecology-streams@1';
  plan: Readonly<EvaluationPlan>;
  status: 'completed' | 'cancelled' | 'failed';
  reason: string;
  runs: EvaluationRun[];
}

/** Fixed factorial order and bounded chunks; failures never trigger seed replacement. */
export async function evaluatePlan(
  input: unknown,
  signal: AbortSignal,
  progress: (run: EvaluationRun, completed: number, total: number) => void = () => {},
  yieldWork: () => Promise<void> = () => new Promise(resolve => setTimeout(resolve, 0)),
): Promise<EvaluationResult> {
  const plan = validateEvaluationPlan(input);
  const result: EvaluationResult = {format: 'mathos-ecology-evaluation', version: 1,
    engine: 'ecology-reference@4', bodyGenome: 'cell-layout@1', controller: 'linear-td@1',
    rng: 'mulberry32@1', streams: 'ecology-streams@1', plan, status: 'completed',
    reason: 'requested-horizon', runs: []};
  for (const seed of plan.seeds) for (const learning of [false, true]) for (const structuralMutation of [false, true]) {
    if (signal.aborted) {
      if (result.status !== 'failed') result.status = 'cancelled';
      result.reason = result.status === 'failed' ? 'failed-and-interrupted' : 'interrupted';
      return result;
    }
    let world = model.initialize({format: 'mathos-ecology', version: 4, seed, mode: plan.mode, learning, structuralMutation});
    let populationTicks = 0, peakPopulation = world.creatures.length;
    let firstExtinctionTick: number | null = null;
    let status: EvaluationRun['status'] = 'completed', reason = 'requested-horizon';
    try {
      while (world.tick < plan.ticksPerRun && !signal.aborted) {
        for (let i = 0; i < 8 && world.tick < plan.ticksPerRun && !signal.aborted; i++) {
          world = model.step(world);
          populationTicks += world.creatures.length;
          peakPopulation = Math.max(peakPopulation, world.creatures.length);
          if (world.creatures.length === 0 && firstExtinctionTick === null) firstExtinctionTick = world.tick;
        }
        await yieldWork();
      }
      if (signal.aborted && world.tick < plan.ticksPerRun) { status = 'cancelled'; reason = 'interrupted'; }
    } catch (error) {
      status = 'failed'; reason = error instanceof Error ? error.message : 'Evaluation failed.';
    }
    const metrics = ecologyMetrics(world);
    if (metrics.accounted !== metrics.supplied) { status = 'failed'; reason = 'Endpoint resource accounting failed.'; }
    const run: EvaluationRun = {definition: {...world.definition}, status, reason, ticks: world.tick,
      populationTicks, peakPopulation, firstExtinctionTick, totalIntake: world.lineage.reduce((n, l) => n + l.intake, 0),
      updates: world.lineage.reduce((n, l) => n + l.updates, 0),
      enabledProposals: world.lineage.filter(l => l.layoutAttempt && !l.layoutAttempt.includes('disabled')).length,
      acceptedChanges: world.lineage.filter(l => l.layoutMutation).length,
      maxGenome: Math.max(0, ...world.lineage.map(l => l.genes.layout.length)),
      maxDeveloped: Math.max(0, ...world.lineage.map(l => l.developed)),
      distinctBirthGenomes: new Set(world.lineage.map(l => layoutKey(l.genes.layout))).size, metrics};
    result.runs.push(run);
    // Progress receives a copy so instrumentation cannot corrupt reported outcomes.
    progress({...run, definition: {...run.definition}, metrics: {...run.metrics}}, result.runs.length, plan.seeds.length * 4);
    if (status === 'failed') { result.status = 'failed'; result.reason = 'one-or-more-worlds-failed'; }
    if (status === 'cancelled') {
      if (result.status !== 'failed') result.status = 'cancelled';
      result.reason = result.status === 'failed' ? 'failed-and-interrupted' : 'interrupted';
      return result;
    }
  }
  return result;
}

/** Every expected contrast remains explicit, including incomplete pairs. */
export function evaluationContrasts(result: EvaluationResult) {
  return result.plan.seeds.flatMap(seed => (['learning', 'structuralMutation'] as const).flatMap(factor =>
    [false, true].map(fixedValue => {
      const fixedFactor = factor === 'learning' ? 'structuralMutation' : 'learning';
      const find = (value: boolean) => result.runs.find(r => r.definition.seed === seed &&
        r.definition[factor] === value && r.definition[fixedFactor] === fixedValue && r.status === 'completed');
      const off = find(false), on = find(true);
      return {seed, factor, fixedFactor, fixedValue, difference: off && on ? {
        survivors: on.metrics.population - off.metrics.population,
        populationTicks: on.populationTicks - off.populationTicks,
        intake: on.totalIntake - off.totalIntake,
        births: on.metrics.births - off.metrics.births, deaths: on.metrics.deaths - off.metrics.deaths,
      } : null};
    })));
}
