import { useEffect, useRef, useState } from 'react';
import { lifeFromExperiment, parseLifeRun, serializeLifeRun, validateLifeRun, type LifeRun } from '../domain/life-run';
import { DEFAULT_EXPERIMENT, MAX_IMPORT_BYTES } from '../domain/experiment';
import { loadLife, saveLife } from '../storage/life-storage';
import { LifeRuntime } from '../runtime/life-runtime';
import { lifeMetrics, type LifeState } from '../life/engine';
import { compareSeeds, type BatchResult } from '../life/experiments';

const DEFAULT = lifeFromExperiment({ ...DEFAULT_EXPERIMENT, name: 'Pixel life baseline', seed: 42, universe: { width: 32, height: 32 }, genesis: { mode: 'seeded' } });
function localStore(): Storage {
  try { return window.localStorage; } catch { throw Error('Life storage is unavailable. Import/export still works.'); }
}
function draftOf(d: LifeRun) { return { name: d.name, seed: String(d.seed), width: String(d.universe.width), height: String(d.universe.height), mode: d.genesis.mode, boundary: d.rules.boundary, divisor: String(d.rules.transferDivisor) }; }
function download(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function LifeCanvas({ world, onSelect }: { world: LifeState; onSelect: (x: number, y: number) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null), { width, height } = world.definition.universe;
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d'); if (!ctx) return;
    const image = ctx.createImageData(width, height);
    for (let i = 0; i < world.field.length; i++) {
      const value = Math.min(1, world.field[i]! / 2048), offset = i * 4;
      image.data[offset] = Math.round(8 + value * 28); image.data[offset + 1] = Math.round(18 + value * 84); image.data[offset + 2] = Math.round(30 + value * 120); image.data[offset + 3] = 255;
    }
    for (const o of world.organisms) for (const site of o.cells) {
      const offset = site * 4; image.data[offset] = 80 + (o.id * 31 % 120); image.data[offset + 1] = 230; image.data[offset + 2] = 130 + (o.id * 19 % 90);
    }
    ctx.putImageData(image, 0, 0);
  }, [world, width, height]);
  return <canvas ref={canvas} width={width} height={height} className="life-canvas" style={{ aspectRatio: `${width} / ${height}` }} role="img" aria-label={`Pixel life universe, ${width} by ${height}, tick ${world.tick}, ${world.organisms.length} organisms. Exact values are in Inspect.`} onClick={e => {
    const box = e.currentTarget.getBoundingClientRect(); onSelect(Math.min(width - 1, Math.max(0, Math.floor((e.clientX - box.left) / box.width * width))), Math.min(height - 1, Math.max(0, Math.floor((e.clientY - box.top) / box.height * height))));
  }} />;
}
function LifeWorkspace({ runtime, onView, view, onBatch }: { runtime: LifeRuntime; onBatch: () => void; onView: (v: 'viewport' | 'setup' | 'inspect') => void; view: string }) {
  const [world, setWorld] = useState(() => runtime.snapshot());
  const [summary, setSummary] = useState(() => runtime.summary());
  const [coords, setCoords] = useState({ x: '16', y: '16' });
  const [selectedId, setSelectedId] = useState(1);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [batchProgress, setBatchProgress] = useState('');
  const [batchRunning, setBatchRunning] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const viewportTitle = useRef<HTMLHeadingElement>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    viewportTitle.current?.focus({ preventScroll: true });
    const unsub = runtime.subscribe(() => { setSummary(runtime.summary()); setWorld(runtime.snapshot()); });
    const hidden = () => { if (document.hidden) { runtime.pause(); abort.current?.abort(); } };
    document.addEventListener('visibilitychange', hidden);
    return () => { alive.current = false; abort.current?.abort(); unsub(); document.removeEventListener('visibilitychange', hidden); };
  }, [runtime]);
  const metrics = lifeMetrics(world), { width, height } = world.definition.universe;
  const x = Number(coords.x), y = Number(coords.y);
  const valid = coords.x.trim() !== '' && coords.y.trim() !== '' && Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < width && y >= 0 && y < height;
  const occupant = valid ? world.organisms.find(o => o.cells.includes(y * width + x)) : undefined;
  const selected = world.organisms.find(o => o.id === selectedId);
  const lineage = world.lineage.find(l => l.id === selectedId);
  async function compare() {
    runtime.pause(); onBatch(); const controller = new AbortController(); abort.current = controller; setBatchRunning(true); setResult(null);
    try {
      const output = await compareSeeds(world.definition, controller.signal, (tick, seed) => { if (alive.current) setBatchProgress(`Seed ${seed}: tick ${tick} / 500`); });
      if (alive.current) { setResult(output); setBatchProgress(`${output.status}: ${output.reason}`); }
    } finally { if (alive.current) setBatchRunning(false); }
  }
  return <>
    <section className="panel life-viewport" aria-labelledby="life-viewport-title">
      <p className="eyebrow">02 / PIXEL UNIVERSE</p><h2 id="life-viewport-title" ref={viewportTitle} tabIndex={-1}>{world.definition.name}</h2>
      <p className="hint">{world.definition.genesis.mode} · seed {world.definition.seed} · {width}×{height} · {world.definition.rules.boundary}</p>
      <p>Tick <strong data-testid="life-tick">{world.tick}</strong> / 2000 · <span data-testid="life-status">{summary.status}</span></p>
      <LifeCanvas world={world} onSelect={(a, b) => { setCoords({ x: String(a), y: String(b) }); const o = world.organisms.find(o => o.cells.includes(b * width + a)); if (o) setSelectedId(o.id); onView('inspect'); }} />
      <p className="hint">Blue: resources (0–2048; higher values saturate). Green: occupied pixels. Use Inspect for exact values.</p>
      <div className="actions">
        <button className="primary" disabled={batchRunning || !['running', 'paused'].includes(summary.status)} onClick={() => summary.status === 'running' ? runtime.pause() : runtime.start()}>{summary.status === 'running' ? 'Pause life' : 'Start life'}</button>
        <button disabled={batchRunning || summary.status !== 'paused'} onClick={() => runtime.singleStep()}>Step life</button>
        <button disabled={batchRunning} onClick={() => { runtime.pause(); if (world.tick === 0 || window.confirm('Discard life progress and restart at tick zero?')) runtime.reset(); }}>Reset life</button>
      </div>
      <p className="hint">10 ticks/second. Hidden tabs pause. Fixed integer controller; lifetime learning is planned.</p>
      {summary.error && <p role="alert">{summary.error}</p>}
    </section>
    <section className="panel life-inspect" aria-labelledby="life-inspect-title">
      <p className="eyebrow">03 / INSPECT</p><h2 id="life-inspect-title">Living structure & accounting</h2>
      <dl className="life-metrics">
        {Object.entries(metrics).map(([key, value]) => <div key={key}><dt>{key}</dt><dd data-testid={key === 'tick' ? 'life-metric-tick' : `life-${key}`}>{value}</dd></div>)}
      </dl>
      <p className="hint">Field + stores + 32×cells + dissipation = initial <strong>{world.initialTotal}</strong>. All units are abstract.</p>
      <div className="dimensions"><label>Pixel x<input aria-label="Life pixel x" type="number" min="0" max={width - 1} value={coords.x} onChange={e => setCoords({ ...coords, x: e.target.value })} /></label><label>Pixel y<input aria-label="Life pixel y" type="number" min="0" max={height - 1} value={coords.y} onChange={e => setCoords({ ...coords, y: e.target.value })} /></label></div>
      <p>{valid ? `Resource: ${world.field[y * width + x]}; occupant: ${occupant ? `organism ${occupant.id}` : 'none'}` : 'Enter coordinates within this universe.'}</p>
      <label>Organism / lineage ID<input aria-label="Organism ID" type="number" min="1" max={Math.max(1, world.lineage.length)} value={selectedId} onChange={e => setSelectedId(Number(e.target.value))} /></label>
      {lineage ? <p>Parent: {lineage.parent ?? 'root'} · born {lineage.born} · {lineage.died === null ? 'alive' : `died ${lineage.died}`} · mutation: {String(lineage.mutated)}</p> : <p>No organism with this ID. Primordial begins without organisms.</p>}
      {selected && <><p>{selected.cells.length} pixels · energy {selected.energy} · neural score {selected.score}</p><p className="hint">Score = bias + resourceWeight × floor(candidate/256) + energyWeight × floor(energy/32). Nonnegative permits growth; no candidate means no growth. Score is from this tick’s pre-growth decision.</p><dl className="life-metrics">{Object.entries(selected.genome).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></>}
      <details><summary>Lineage records ({world.lineage.length} / 512)</summary><div className="life-table-scroll"><table><thead><tr><th>ID</th><th>Parent</th><th>Born</th><th>Died</th><th>Mutated</th></tr></thead><tbody>{world.lineage.map(l => <tr key={l.id}><td>{l.id}</td><td>{l.parent ?? 'root'}</td><td>{l.born}</td><td>{l.died ?? '—'}</td><td>{l.mutated ? 'yes' : 'no'}</td></tr>)}</tbody></table></div></details>
      <p className="hint">life-reference@1 · pixel-life@1 · mulberry32@1</p>
    </section>
    <section className="panel life-batch" aria-labelledby="life-batch-title" data-view={view}>
      <p className="eyebrow">04 / LOCAL EXPERIMENTS</p><h2 id="life-batch-title">Three-seed comparison</h2>
      <p>Compare the active definition at seed, seed+1 and seed+2 for 500 ticks each. The interactive run pauses and stays intact. Results restart from tick zero.</p>
      <div className="actions"><button disabled={batchRunning} onClick={() => void compare()}>Compare three seeds</button><button disabled={!batchRunning} onClick={() => abort.current?.abort()}>Cancel comparison</button><button disabled={!result || batchRunning} onClick={() => { if (result) download(JSON.stringify(result, null, 2) + '\n', 'mathos-life-results.v1.json'); }}>Export comparison</button></div>
      <p role="status">{batchProgress}</p>
      {result && <div className="life-table-scroll"><table><caption>Measured endpoint results · {result.status}</caption><thead><tr><th>Seed</th><th>Tick</th><th>Population</th><th>Births</th><th>Deaths</th><th>Mutations</th><th>Accounted</th></tr></thead><tbody>{result.runs.map(r => <tr key={r.seed}><td>{r.seed}</td><td>{r.metrics.tick}</td><td>{r.metrics.population}</td><td>{r.metrics.births}</td><td>{r.metrics.deaths}</td><td>{r.metrics.mutations}</td><td>{r.metrics.accounted}</td></tr>)}</tbody></table></div>}
      <p className="hint">No remote execution. No checkpoint resume or lifetime learning. Cancelled/failed results retain partial ticks and a termination reason.</p>
    </section>
  </>;
}
export function LifeLab({ onExit }: { onExit: () => void }) {
  const [draft, setDraft] = useState(() => draftOf(DEFAULT));
  const [runtime, setRuntime] = useState(() => new LifeRuntime(DEFAULT));
  const [generation, setGeneration] = useState(0);
  const [hasBatch, setHasBatch] = useState(false);
  const [view, setView] = useState<'viewport' | 'setup' | 'inspect'>('viewport');
  const [message, setMessage] = useState('Experimental baseline prepared, paused. No lifetime learning.');
  const [error, setError] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const importing = useRef(false);
  const importEpoch = useRef(0);
  useEffect(() => () => { importEpoch.current++; }, []);
  useEffect(() => runtime.attach(), [runtime]);

  function definition() { return validateLifeRun({ ...DEFAULT, name: draft.name, seed: draft.seed.trim() ? Number(draft.seed) : NaN,
    universe: { width: draft.width.trim() ? Number(draft.width) : NaN, height: draft.height.trim() ? Number(draft.height) : NaN },
    genesis: { ...DEFAULT.genesis, mode: draft.mode }, rules: { ...DEFAULT.rules, boundary: draft.boundary, transferDivisor: Number(draft.divisor) } }); }
  function report(action: () => void) { try { action(); setError(false); } catch (cause) { setError(true); setMessage(cause instanceof Error ? cause.message : 'Operation failed.'); } }
  function replace(d: LifeRun) {
    runtime.pause();
    if ((runtime.summary().tick > 0 || hasBatch) && !window.confirm('Discard life progress and comparison results; prepare this definition at tick zero?')) { setMessage('Replacement cancelled. Run preserved and paused.'); return; }
    importEpoch.current++; setHasBatch(false); const next = new LifeRuntime(d); runtime.dispose(); setRuntime(next); setGeneration(n => n + 1); setDraft(draftOf(d)); setView('viewport'); setMessage('Life definition prepared at tick zero, paused.');
  }
  return <>
    <header className="masthead"><div className="wordmark">MATHOS <small>EXPERIMENTAL LIFE BASELINE</small></div><button onClick={() => { runtime.pause(); if (window.confirm('Leave the life lab and discard this run and comparison results?')) onExit(); }}>Return to reference substrate</button></header>
    <main className="life-dashboard" data-view={view}>
      <section className="intro"><div><p className="eyebrow">INTEGRATED REFERENCE / PHASES 2–6 SKELETON</p><h1>Pixels → organisms → experiments</h1></div><p className="scope">Growth, inheritance and a fixed neural controller.<br />An abstract model; spontaneous life and intelligence are not claimed.</p></section>
      <div className="life-grid">
        <section className="panel life-setup" aria-labelledby="life-setup-title"><p className="eyebrow">01 / MODEL</p><h2 id="life-setup-title">Life configuration</h2><p className="hint">Draft edits apply only when prepared. Active runs are separate.</p>
          <form onSubmit={e => { e.preventDefault(); report(() => replace(definition())); }}>
            <label>Name<input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
            <label>Life seed<input type="number" min="0" max="4294967295" value={draft.seed} onChange={e => setDraft({ ...draft, seed: e.target.value })} /></label>
            <div className="dimensions"><label>Life width<input type="number" min="8" max="64" value={draft.width} onChange={e => setDraft({ ...draft, width: e.target.value })} /></label><label>Life height<input type="number" min="8" max="64" value={draft.height} onChange={e => setDraft({ ...draft, height: e.target.value })} /></label></div>
            <label>Life genesis<select aria-label="Life genesis" value={draft.mode} onChange={e => setDraft({ ...draft, mode: e.target.value as LifeRun['genesis']['mode'] })}><option value="seeded">Seeded center-cell template</option><option value="primordial">Primordial resource recipe</option></select></label>
            <p className="hint">Primordial has resources only; no spontaneous organism mechanism. Seeded creates one authored organism.</p>
            <label>Life boundary<select aria-label="Life boundary" value={draft.boundary} onChange={e => setDraft({ ...draft, boundary: e.target.value as LifeRun['rules']['boundary'] })}><option value="periodic">Periodic</option><option value="closed">Closed</option></select></label>
            <label>Life transfer divisor<select aria-label="Life transfer divisor" value={draft.divisor} onChange={e => setDraft({ ...draft, divisor: e.target.value })}><option>8</option><option>16</option></select></label>
            <button type="submit" className="primary">Prepare life from draft</button>
          </form>
          <div className="actions"><button onClick={() => report(() => { saveLife(localStore(), definition()); setMessage('Life draft saved locally. Export for a portable backup.'); })}>Save life draft</button><button onClick={() => report(() => { replace(loadLife(localStore())); })}>Load life saved</button><button onClick={() => report(() => { download(serializeLifeRun(runtime.summary().definition), 'mathos-life-run.v1.json'); setMessage('Active definition exported. This restarts at tick zero, not a checkpoint.'); })}>Export active life definition</button><button onClick={() => file.current?.click()}>Import life definition</button></div>
          <input ref={file} type="file" className="file-input" accept=".json,application/json" aria-label="Life definition file" onChange={e => {
            const selected = e.currentTarget.files?.[0]; e.currentTarget.value = ''; if (!selected || importing.current) return;
            importing.current = true; const epoch = ++importEpoch.current;
            void (async () => { try { if (selected.size > MAX_IMPORT_BYTES) throw Error('Life file exceeds 64 KiB.'); const d = parseLifeRun(await selected.text()); if (epoch === importEpoch.current) report(() => replace(d)); } catch (cause) { if (epoch === importEpoch.current) { setError(true); setMessage(cause instanceof Error ? cause.message : 'Import failed.'); } } finally { importing.current = false; } })();
          }} />
          <p role="status" className={`feedback ${error ? 'error' : ''}`}>{message}</p><p className="hint">Limits: 64 organisms, 8 pixels each, 512 lifetime births, 2,000 ticks. No autosave. Browser storage can be cleared.</p>
        </section>
        <LifeWorkspace key={generation} runtime={runtime} onBatch={() => setHasBatch(true)} onView={setView} view={view} />
      </div>
      <nav className="mobile-navigation" aria-label="Life workspace"><button aria-pressed={view === 'viewport'} onClick={() => setView('viewport')}>Viewport</button><button aria-pressed={view === 'setup'} onClick={() => setView('setup')}>Setup</button><button aria-pressed={view === 'inspect'} onClick={() => setView('inspect')}>Inspect</button></nav>
    </main><footer>MATHOS / INTEGRATED BASELINE · LOCAL ONLY</footer>
  </>;
}
