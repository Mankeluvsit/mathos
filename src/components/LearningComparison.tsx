import { useEffect, useRef, useState } from 'react';
import { compareLearning, pairedDifferences, type Comparison } from '../ecology/learning-experiments';

declare const __MATHOS_SOURCE__: Comparison['source'];
export function LearningComparison({ pause }: { pause: () => void }) {
  const abort = useRef<AbortController | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Comparison | null>(null);
  useEffect(() => {
    const hidden = () => { if (document.hidden) abort.current?.abort(); };
    document.addEventListener('visibilitychange', hidden);
    return () => { abort.current?.abort(); abort.current = null; document.removeEventListener('visibilitychange', hidden); };
  }, []);
  async function start() {
    if (abort.current) return;
    pause();
    const controller = new AbortController(); abort.current = controller;
    setRunning(true); setProgress(0); setResult(null);
    const output = await compareLearning(__MATHOS_SOURCE__, controller.signal, (done, total) => {
      if (abort.current === controller) setProgress(Math.floor(100 * done / total));
    });
    if (abort.current !== controller) return;
    abort.current = null; setResult(output); setRunning(false);
  }
  function download() {
    if (!result) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2) + '\n'], {type: 'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = 'mathos-learning-comparison.v1.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="panel ecology-evolution" aria-labelledby="learning-comparison-title">
    <h2 id="learning-comparison-title">Does learning help?</h2>
    <p>Run six starting seeds twice: learning off, then on. Each world runs for 1,600 steps. Your world pauses and is kept separate. This can take a minute or more; leaving the browser tab cancels the comparison.</p>
    <div className="actions"><button disabled={running} onClick={() => void start()}>Compare learning on / off</button>
      {running && <button onClick={() => abort.current?.abort()}>Cancel learning comparison</button>}
      {result && <button onClick={download}>Export learning comparison</button>}</div>
    <p role="status" data-testid="learning-comparison-status">{running ? 'Comparison running.' : result ? `Comparison ${result.status}: ${result.runs.filter(r => r.status === 'completed').length} of 12 runs complete.` : 'Comparison not run yet.'}</p>
    {running && <p><progress aria-label="Learning comparison progress" max={100} value={progress} /> {progress}%</p>}
    {result && <>
      <p>{result.reason}</p>
      <p>Differences below are <strong>learning on minus off</strong>. Positive does not always mean better: more deaths can accompany more births. Partial pairs have no difference.</p>
      <div className="life-table-scroll"><table><thead><tr><th>Seed</th><th>Survivors</th><th>Births</th><th>Deaths</th><th>Population-time</th><th>Food taken</th></tr></thead><tbody>
        {pairedDifferences(result).map(p => <tr key={p.seed}><th scope="row">{p.seed}</th>{(['survivors','births','deaths','populationTicks','totalIntake'] as const).map(k => <td key={k}>{p.difference ? `${p.difference[k] > 0 ? '+' : ''}${p.difference[k]}` : 'Incomplete'}</td>)}</tr>)}
      </tbody></table></div>
      <details><summary>Exact results for every run</summary><div className="life-table-scroll"><table><thead><tr><th>Seed</th><th>Learning</th><th>State</th><th>Steps</th><th>Alive</th><th>First extinction</th><th>Updates</th><th>Compute ms</th></tr></thead><tbody>
        {result.runs.map(r => <tr key={`${r.definition.seed}-${r.definition.learning}`}><th scope="row">{r.definition.seed}</th><td>{r.definition.learning ? 'On' : 'Off'}</td><td>{r.status}</td><td>{r.ticks}</td><td>{r.metrics.population}</td><td>{r.firstExtinctionTick ?? 'None'}</td><td>{r.updates}</td><td>{Math.round(r.computeMs)}</td></tr>)}
      </tbody></table></div></details>
      <p className="hint">Population-time sums the number alive after each step. These are development seeds, not held-out evidence. Compute time depends on your device. The export contains full measurements and versions, not a resumable checkpoint.</p>
    </>}
  </section>;
}
