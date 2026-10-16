import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MAX_IMPORT_BYTES, type Experiment } from '../domain/experiment';
import { parseSubstrateRun, serializeSubstrateRun, substrateFromExperiment, validateSubstrateRun, type SubstrateRun } from '../domain/substrate-run';
import { SubstrateRuntime, type Rate } from '../runtime/substrate-runtime';
import { drawField, type Palette } from '../rendering/field-renderer';
import { loadSubstrate, saveSubstrate } from '../storage/substrate-storage';
import { FieldInspector } from './FieldInspector';

function browserStorage() {
  try { return window.localStorage; }
  catch { throw new Error('Local storage is unavailable. Import/export still works.'); }
}

function RunView({ runtime, locked }: { runtime: SubstrateRuntime; locked: boolean }) {
  const [summary, setSummary] = useState(() => runtime.summary());
  const [snapshot, setSnapshot] = useState(() => runtime.snapshot());
  const [palette, setPalette] = useState<Palette>('spectrum');
  const canvas = useRef<HTMLCanvasElement>(null);
  const heading = useRef<HTMLDivElement>(null);
  useEffect(() => {
    heading.current?.focus();
    heading.current?.scrollIntoView?.({ block: 'start' });
  }, [runtime]);
  useEffect(() => {
    const draw = () => { if (canvas.current) drawField(canvas.current, runtime.snapshot(), palette); };
    draw();
    const unsubscribe = runtime.subscribe(() => { setSummary(runtime.summary()); setSnapshot(runtime.snapshot()); });
    const unsubscribeDraw = runtime.subscribeDraw(draw);
    return () => { unsubscribe(); unsubscribeDraw(); };
  }, [runtime, palette]);
  const { definition, metrics, tick, status } = summary;
  return <div className="run-view" data-run-status={status}>
    <div className="viewport-header" ref={heading} tabIndex={-1}>
      <div><span className="eyebrow">02 / UNIVERSE</span><h3>Active substrate: {definition.name}</h3></div>
      <span className={`state-badge state-${status}`}>{status.toUpperCase()}</span>
      <p className="run-metadata">{definition.universe.width} × {definition.universe.height} pixels · seed {definition.seed} · tick {tick} · {definition.rules.boundary}</p>
    </div>
    <figure className="preview run-viewport">
      <div className="canvas-frame"><canvas ref={canvas} role="img" aria-label={`Live substrate field, ${definition.universe.width} by ${definition.universe.height} pixels. Numerical values are available in the pixel inspector.`} /></div>
      <figcaption><span className={`color-scale palette-${palette}`} aria-hidden="true" /><span>0 — 32768 — 65535 · fixed resource scale</span></figcaption>
    </figure>
    <div className="playback-bar">
      <div className="playback-actions"><button type="button" className="primary" disabled={locked || status === 'completed' || status === 'error'} onClick={() => status === 'running' ? runtime.pause() : runtime.start()}>{status === 'running' ? 'Pause' : 'Start'}</button>
      <button type="button" disabled={locked || status !== 'paused'} onClick={() => runtime.singleStep()}>Step</button></div>
      <div><label className="inline-label" htmlFor="run-rate">Display rate</label><select id="run-rate" disabled={locked} value={summary.rate} onChange={(e) => runtime.setRate(Number(e.target.value) as Rate)}><option value="1">1 tick / second</option><option value="10">10 ticks / second</option><option value="30">30 ticks / second</option></select></div>
      <div><label className="inline-label" htmlFor="field-palette">Field palette</label><select id="field-palette" value={palette} onChange={(e) => setPalette(e.target.value as Palette)}><option value="spectrum">Spectrum</option><option value="thermal">Thermal</option><option value="grayscale">Grayscale</option></select></div>
    </div>
    <aside id="field-inspector" className="inspector-panel" aria-label="Field analysis">
      <p className="eyebrow">03 / INSPECT</p><h3>Field analysis</h3>
      <p className="run-status" role="status" aria-live="polite">{status === 'completed' ? 'Completed: 10,000-tick limit reached.' : status === 'error' ? `Engine stopped: ${summary.error}` : status === 'running' ? 'Running substrate transport.' : 'Paused. Step advances one tick.'}</p>
      <dl className="metrics" aria-label="Field metrics" aria-live="off">
        <div><dt>Tick</dt><dd data-testid="tick">{tick}</dd></div><div><dt>Total</dt><dd data-testid="field-total">{metrics.sum}</dd></div>
        <div><dt>Minimum</dt><dd data-testid="field-min">{metrics.min}</dd></div><div><dt>Maximum</dt><dd data-testid="field-max">{metrics.max}</dd></div>
      </dl>
      <FieldInspector snapshot={snapshot} />
      <div className="model-equation"><h4>Transport rule</h4><code>q = trunc((a − b) / {definition.rules.transferDivisor})</code><p>Neighboring pixels exchange whole resource units using the previous tick. The total is conserved.</p></div>
      <p className="hint">Metrics and inspector share a sampled tick. Pause for exact inspection. Small gradients can settle due to integer rounding.</p>
      <details className="provenance"><summary>Model provenance</summary><p>Engine substrate-reference@1 · RNG mulberry32@1 · rules conservative-transport@1</p><p>{definition.initializer.id} · divisor {definition.rules.transferDivisor}</p></details>
    </aside>
  </div>;
}

type Pending = { definition: SubstrateRun } | { reset: true };

export function SubstrateControls({ getExperiment, preview, onPrepared, onSetup }: { getExperiment: () => Experiment; preview?: ReactNode; onPrepared?: () => void; onSetup?: () => void }) {
  const [open, setOpen] = useState(false);
  const [runtime, setRuntime] = useState<SubstrateRuntime | null>(null);
  const runtimeRef = useRef<SubstrateRuntime | null>(null);
  const [generation, setGeneration] = useState(0);
  const [initializer, setInitializer] = useState<SubstrateRun['initializer']['id']>('uniform-noise');
  const [boundary, setBoundary] = useState<SubstrateRun['rules']['boundary']>('periodic');
  const [divisor, setDivisor] = useState<8 | 16>(8);
  const [pending, setPending] = useState<Pending | null>(null);
  const confirmation = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (pending) confirmation.current?.focus();
    else returnFocus.current?.focus();
  }, [pending]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hide = () => {
      if (document.hidden && runtimeRef.current?.summary().status === 'running') {
        runtimeRef.current.pause(); setMessage('Run paused because this tab is hidden. Resume explicitly when ready.');
      }
    };
    document.addEventListener('visibilitychange', hide);
    return () => { document.removeEventListener('visibilitychange', hide); runtimeRef.current?.dispose(); };
  }, []);

  function report(action: () => void) {
    try { action(); setError(false); }
    catch (cause) { setError(true); setMessage(cause instanceof Error ? cause.message : 'Operation failed; the active run is unchanged.'); }
  }
  function install(definition: SubstrateRun) {
    const next = new SubstrateRuntime(definition);
    runtimeRef.current?.dispose(); runtimeRef.current = next; setRuntime(next);
    setGeneration((value) => value + 1);
    setInitializer(definition.initializer.id); setBoundary(definition.rules.boundary); setDivisor(definition.rules.transferDivisor);
    setMessage('Substrate prepared at tick zero, paused. Organism genesis is not executed.'); setPending(null); onPrepared?.();
  }
  function apply(action: Pending) {
    if (runtime && runtime.summary().tick > 0) { returnFocus.current = document.activeElement as HTMLElement | null; runtime.pause(); setPending(action); return; }
    execute(action);
  }
  function execute(action: Pending) {
    if ('definition' in action) install(action.definition);
    else { runtime?.reset(); setMessage('Reset to the same initial field at tick zero, paused.'); setPending(null); }
  }
  async function importFile(file: File) {
    setImporting(true);
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('Substrate file exceeds the 64 KiB limit.');
      const definition = parseSubstrateRun(await file.text());
      apply({ definition }); setError(false);
    } catch (cause) { setError(true); setMessage(cause instanceof Error ? cause.message : 'Could not read this file. The active run is unchanged.'); }
    finally { setImporting(false); }
  }

  const prepareButton = <button type="button" className="primary" onClick={() => report(() => {
            const base = substrateFromExperiment(getExperiment());
            apply({ definition: validateSubstrateRun({ ...base, initializer: { id: initializer, version: 1 }, rules: { ...base.rules, boundary, transferDivisor: divisor } }) });
          })}>Prepare substrate from draft</button>;

  return <section id="substrate-lab" className="panel substrate-lab" aria-labelledby="lab-title">
    <div className="lab-heading"><div><p className="eyebrow">SIMULATE / PIXEL WORLD</p><h2 id="lab-title">Substrate laboratory</h2></div><span className="model-badge">REFERENCE MODEL</span></div>
    {!open && <div className="lab-welcome"><p>Mathematics becomes a field you can inspect.</p><button type="button" className="primary" onClick={() => { setOpen(true); onSetup?.(); }}>Open substrate lab</button><span className="hint">Local execution · explicit controls · reproducible inputs</span></div>}
    {open && !runtime && <div className="lab-welcome"><p>Ready to test the current draft?</p>{prepareButton}</div>}
    {runtime ? <RunView key={generation} runtime={runtime} locked={pending !== null} /> : <div className="empty-workspace"><div className="empty-viewport"><div className="viewport-header"><span className="eyebrow">02 / UNIVERSE</span><span className="state-badge">DRAFT PREVIEW</span></div>{preview}<p className="hint">Prepare a substrate to observe measured transport. Organism genesis is planned.</p></div><aside id="field-inspector" className="inspector-panel empty-inspector" aria-label="Field analysis"><p className="eyebrow">03 / INSPECT</p><h3>No active run</h3><p>Prepare a substrate to inspect exact resource values, coordinates, and conservation.</p><div className="model-equation"><h4>Reference transport</h4><code>q = trunc((a − b) / d)</code><p>One model connects the rule, pixel field, and numerical inspector.</p></div><p className="hint">Neural learning, evolution, and morphogenesis remain planned.</p></aside></div>}
    {open && <>
      <div id="run-setup" className="lab-settings"><div className="settings-heading"><span className="eyebrow">04 / RUN SETUP</span><h3>Prepare & preserve</h3></div><fieldset disabled={importing || pending !== null} aria-label="Next substrate definition">
        <div className="substrate-settings">
          <div><label htmlFor="initializer">Initial field</label><select id="initializer" value={initializer} onChange={(e) => setInitializer(e.target.value as typeof initializer)}><option value="uniform-noise">Seeded uniform noise</option><option value="center-impulse">Center impulse</option></select></div>
          <div><label htmlFor="boundary">Boundary</label><select id="boundary" value={boundary} onChange={(e) => setBoundary(e.target.value as typeof boundary)}><option value="periodic">Periodic (wrap)</option><option value="closed">Closed (no flux)</option></select></div>
          <div><label htmlFor="divisor">Transfer divisor</label><select id="divisor" value={divisor} onChange={(e) => setDivisor(Number(e.target.value) as 8 | 16)}><option value="8">8</option><option value="16">16</option></select></div>
        </div>
        <p className="hint">Prepare uses the experiment draft’s name, seed and dimensions with these field settings. Changes apply only when you prepare a new run.</p>
        <div className="actions">
          {runtime && prepareButton}
          <button type="button" disabled={!runtime} onClick={() => report(() => apply({ reset: true }))}>Reset substrate</button>
          <button type="button" disabled={!runtime} onClick={() => report(() => { saveSubstrate(browserStorage(), runtime!.summary().definition); setMessage('Run definition saved locally. It restarts at tick zero; it is not a checkpoint.'); })}>Save run definition</button>
          <button type="button" onClick={() => report(() => apply({ definition: loadSubstrate(browserStorage()) }))}>Load run definition</button>
          <button type="button" disabled={!runtime} onClick={() => report(() => {
            const text = serializeSubstrateRun(runtime!.summary().definition);
            const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
            const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'mathos-substrate-run.v1.json';
            document.body.appendChild(anchor); anchor.click(); anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            setMessage('Run definition exported. Import restarts at tick zero; this is not a checkpoint.');
          })}>Export run JSON</button>
          <button type="button" onClick={() => fileInput.current?.click()}>Import run JSON</button>
        </div>
      </fieldset></div>
      <input className="file-input" ref={fileInput} type="file" accept=".json,application/json" aria-label="Import substrate definition file" tabIndex={-1} disabled={importing || pending !== null} onChange={(event) => {
        const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (file) void importFile(file);
      }} />
      <p className="hint definition-note">Definitions store configuration only, in a separate browser slot. Export a portable copy. Runs stop at 10,000 ticks and pause when the tab is hidden.</p>
      {pending && <div className="confirmation" ref={confirmation} tabIndex={-1} role="group" aria-label="Confirm discarding progress">
        <p>The run is paused. Discard its current progress and continue at tick zero?</p>
        <div className="actions"><button type="button" onClick={() => report(() => execute(pending))}>Discard progress and continue</button><button type="button" onClick={() => setPending(null)}>Keep current run</button></div>
      </div>}
      {(message || importing) && <p role="status" aria-live="polite" className={`feedback ${error ? 'error' : ''}`}>{importing ? 'Reading substrate definition…' : message}</p>}

    </>}
  </section>;
}
