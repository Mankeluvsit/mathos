import { useEffect, useRef, useState } from 'react';
import { advanceShadow, startShadow, type ShadowRun } from '../ecology/shadow-learning';
import { drawEcology } from '../rendering/ecology-renderer';
import { W, H } from '../ecology/world';

const definition = { format: 'mathos-ecology' as const, version: 2 as const, seed: 42, mode: 'seeded' as const };

export function ShadowLearningDemo() {
  const [run, setRun] = useState<ShadowRun>(() => startShadow(definition, true));
  const [selected, setSelected] = useState(1);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (ctx) drawEcology(ctx, run.world, selected);
  }, [run, selected]);
  const record = run.records.get(selected);
  const organism = run.world.creatures.find(c => c.id === selected);
  function advance(count: number) {
    try {
      setRun(old => {
        let next = old;
        for (let i = 0; i < count; i++) next = advanceShadow(next);
        return next;
      });
    } catch {
      // The world has a finite 1600-step horizon; buttons prevent advancing beyond it.
    }
  }
  return (
    <section className="panel" aria-labelledby="shadow-demo-title">
      <p className="eyebrow">EXPERIMENTAL · OBSERVATION ONLY</p>
      <h2 id="shadow-demo-title">Watch a controller practice learning</h2>
      <p className="hint">This is a real, deterministic simulation. The organisms still follow the original movement rules; the learning controller watches and updates its internal weights but does not control them yet.</p>
      <div className="actions">
        <button disabled={run.world.tick >= 1600} onClick={() => advance(1)}>One step</button>
        <button disabled={run.world.tick >= 1600} onClick={() => advance(Math.min(20, 1600 - run.world.tick))}>Run 20 steps</button>
        <button onClick={() => { setRun(startShadow(definition, true)); setSelected(1); }}>Reset experiment</button>
      </div>
      <p role="status" data-testid="shadow-progress">Step {run.world.tick} / 1600 · {run.world.creatures.length} living organisms · {run.totalUpdates} learning updates</p>
      <canvas ref={canvas} width={W * 12} height={H * 12} className="ecology-canvas" role="img" aria-label={`Shadow experiment pixel world at step ${run.world.tick}`} />
      <label>Inspect organism
        <select aria-label="Shadow organism" value={selected} onChange={e => setSelected(Number(e.target.value))}>
          {run.world.creatures.map(c => <option key={c.id} value={c.id}>#{c.id} · {c.genes.bodyPlan}</option>)}
        </select>
      </label>
      <p data-testid="shadow-weights">Organism #{selected}: {organism ? `energy ${organism.energy}` : 'not alive'} · {record?.updates ?? 0} weight updates · last reward {record?.lastObservedReward ?? '—'}</p>
      <p className="hint">Learned weights (four actions × six inputs): {record ? record.weights.map(row => row.join(', ')).join(' | ') : 'Select a living organism.'}</p>
      <p className="hint">This is not a learning-vs-nonlearning survival comparison. The experiment only demonstrates that weights can change while the original world remains unaffected.</p>
    </section>
  );
}
