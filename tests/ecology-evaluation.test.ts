import {describe, expect, it, vi} from 'vitest';
import {evaluatePlan, evaluationContrasts, validateEvaluationPlan} from '../src/ecology/evaluation';
import * as model from '../src/ecology/genome-model';
import {ecologyMetrics} from '../src/ecology/world';

const input = {format: 'mathos-ecology-evaluation-plan', version: 1, id: 'test-small',
  engine: 'ecology-reference@4', mode: 'seeded', ticksPerRun: 16, seeds: [42]};
const yieldNow = async () => {};

describe('bounded factorial developer evaluation', () => {
  it('rejects malformed and excessive plans and owns a frozen copy', () => {
    const plan = validateEvaluationPlan(input);
    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.seeds)).toBe(true);
    expect(plan.seeds).not.toBe(input.seeds);
    for (const bad of [null, [], {...input, extra: true}, {...input, engine: 'ecology-reference@3'},
      {...input, id: '../unsafe'}, {...input, mode: 'primordial'},
      ...[0, -1, 1601, 1.5, NaN, Infinity].map(ticksPerRun => ({...input, ticksPerRun})),
      ...[[], [42, 42], [-1], [4294967296], [1.5], [NaN], Array.from({length: 9}, (_, i) => i)]
        .map(seeds => ({...input, seeds}))]) expect(() => validateEvaluationPlan(bad)).toThrow();
  });

  it('matches direct trajectories, captures all four treatments and counts each post-step population once', async () => {
    const result = await evaluatePlan(input, new AbortController().signal, undefined, yieldNow);
    expect(result.status).toBe('completed');
    expect(result.runs.map(r => [r.definition.learning, r.definition.structuralMutation]))
      .toEqual([[false, false], [false, true], [true, false], [true, true]]);
    for (const run of result.runs) {
      let world = model.initialize(run.definition), populationTicks = 0, peak = world.creatures.length;
      for (let tick = 0; tick < input.ticksPerRun; tick++) {
        world = model.step(world); populationTicks += world.creatures.length; peak = Math.max(peak, world.creatures.length);
      }
      expect(run.metrics).toEqual(ecologyMetrics(world));
      expect(run.populationTicks).toBe(populationTicks);
      expect(run.peakPopulation).toBe(peak);
      expect(run.totalIntake).toBe(world.lineage.reduce((n, l) => n + l.intake, 0));
      expect(run.updates).toBe(world.lineage.reduce((n, l) => n + l.updates, 0));
      expect(run.metrics.accounted).toBe(run.metrics.supplied);
      expect(run.ticks).toBe(16);
    }
  });

  it('isolates instrumentation and previous results without changing deterministic outcomes', async () => {
    const run = () => evaluatePlan(input, new AbortController().signal, r => {
      r.metrics.population = -999; r.definition.seed = 999;
    }, yieldNow);
    const first = await run(), original = structuredClone(first);
    first.runs[0]!.metrics.population = -1;
    expect(await run()).toEqual(original);
    expect(input.seeds).toEqual([42]);
    expect(original.runs.every(r => r.definition.seed === 42 && r.metrics.population >= 0)).toBe(true);
  });

  it('preserves an interrupted partial world and leaves missing contrasts null', async () => {
    const controller = new AbortController();
    const result = await evaluatePlan(input, controller.signal, undefined, async () => {controller.abort();});
    expect(result.status).toBe('cancelled');
    expect(result.runs).toHaveLength(1);
    expect(result.runs[0]).toMatchObject({status: 'cancelled', ticks: 8, populationTicks: 64});
    expect(evaluationContrasts(result).every(c => c.difference === null)).toBe(true);
    expect((await evaluatePlan(input, controller.signal, undefined, yieldNow)).runs).toHaveLength(0);
  });

  it('records the last valid state on failure, continues other worlds and excludes the failed arm', async () => {
    const realStep = model.step;
    const spy = vi.spyOn(model, 'step').mockImplementationOnce(realStep).mockImplementationOnce(() => {throw Error('controlled failure');});
    try {
      const result = await evaluatePlan(input, new AbortController().signal, undefined, yieldNow);
      expect(result.status).toBe('failed');
      expect(result.runs).toHaveLength(4);
      expect(result.runs[0]).toMatchObject({status: 'failed', ticks: 1, reason: 'controlled failure'});
      expect(result.runs.slice(1).every(r => r.status === 'completed')).toBe(true);
      expect(evaluationContrasts(result).filter(c => c.difference === null)).toHaveLength(2);
    } finally {spy.mockRestore();}
  });

  it('computes signed factorial differences without substituting zeros for incomplete arms', async () => {
    const result = await evaluatePlan(input, new AbortController().signal, undefined, yieldNow);
    // Measurement arithmetic anchors use deliberately distinct endpoints, independently of ecological outcomes.
    for (const [index, run] of result.runs.entries()) {
      run.metrics.population = [10, 7, 14, 12][index]!;
      run.populationTicks = [100, 80, 150, 110][index]!;
    }
    const contrasts = evaluationContrasts(result);
    expect(contrasts.map(c => c.difference?.survivors)).toEqual([4, 5, -3, -2]);
    expect(contrasts.map(c => c.difference?.populationTicks)).toEqual([50, 30, -20, -40]);
    result.runs[0]!.status = 'failed';
    expect(evaluationContrasts(result).map(c => c.difference === null)).toEqual([true, false, true, false]);
  });
});
