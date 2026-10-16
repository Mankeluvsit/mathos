import { useRef, useState } from 'react';
import { EcologyLab } from '../components/EcologyLab';
import { LifeLab } from '../components/LifeLab';
import { PixelPreview } from '../components/PixelPreview';
import { SubstrateControls } from '../components/SubstrateControls';
import { DEFAULT_EXPERIMENT, MAX_IMPORT_BYTES, parseExperiment, serializeExperiment, validateExperiment, type Experiment } from '../domain/experiment';
import { loadExperiment, saveExperiment } from '../storage/experiment-storage';

function makeDraft(value: Experiment) {
  return { name: value.name, seed: String(value.seed), width: String(value.universe.width), height: String(value.universe.height), mode: value.genesis.mode };
}

function numeric(value: string): number {
  return value.trim() === '' ? NaN : Number(value);
}

function previewDimension(value: string): number {
  const n = numeric(value);
  return Number.isInteger(n) && n >= 8 && n <= 256 ? n : 64;
}

function localStore(): Storage {
  try { return window.localStorage; }
  catch { throw new Error('Local storage is unavailable. You can still import or export JSON.'); }
}

function ReferenceApp({ onLife, onEcology }: { onLife: () => void; onEcology: () => void }) {
  const [mobileView, setMobileView] = useState<'universe' | 'setup' | 'inspect'>('universe');
  const [focusMode, setFocusMode] = useState(false);
  const [draft, setDraft] = useState(() => makeDraft(DEFAULT_EXPERIMENT));
  const [message, setMessage] = useState('Ready. Your configuration stays on this device.');
  const [error, setError] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function current(): Experiment {
    return validateExperiment({
      format: 'mathos-experiment', schemaVersion: 1, name: draft.name,
      seed: numeric(draft.seed), universe: { width: numeric(draft.width), height: numeric(draft.height) },
      genesis: { mode: draft.mode },
    });
  }

  function report(action: () => void) {
    try { action(); setError(false); }
    catch (cause) { setError(true); setMessage(cause instanceof Error ? cause.message : 'The operation failed. Your draft is unchanged.'); }
  }

  async function importFile(file: File) {
    setImporting(true);
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('Configuration file exceeds the 64 KiB limit.');
      const value = parseExperiment(await file.text());
      setDraft(makeDraft(value));
      setError(false);
      setMessage('Configuration imported into the draft. Save locally to keep it in this browser.');
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : 'Could not read the file. Your draft is unchanged.');
    } finally { setImporting(false); }
  }

  return (
    <>
      <a className="skip-link" href="#configuration" onClick={() => setMobileView('setup')}>Skip to configuration</a>
      <header className="masthead">
        <a className="wordmark" href="#substrate-lab" onClick={() => setMobileView('universe')}><span className="brand-mark" aria-hidden="true">⬡</span><span>MATHOS<small>MATHEMATICS → LIVING SYSTEMS</small></span></a>
        <nav className="desktop-navigation" aria-label="Workspace shortcuts">
          <a href="#substrate-lab">Universe</a><a href="#configuration" onClick={() => setFocusMode(false)}>Model</a><a href="#field-inspector" onClick={() => setFocusMode(false)}>Inspect</a>
        </nav>
        <div className="header-status"><button className="primary" onClick={onEcology}>Explore living world</button><button type="button" onClick={onLife}>Open life baseline</button><span className="local-badge">LOCAL ONLY</span><span className="phase">Phase 1 · Reference substrate</span><button type="button" className="focus-toggle" aria-pressed={focusMode} onClick={() => setFocusMode(!focusMode)}>{focusMode ? 'Exit focus' : 'Focus viewport'}</button></div>
      </header>
      <main className={`dashboard ${focusMode ? 'focus-mode' : ''}`} data-mobile-view={mobileView}>
        <section className="intro" aria-labelledby="intro-title">
          <div><p className="eyebrow">THE MATHEMATICAL LIFE LABORATORY</p><h1 id="intro-title">One model. A world to explore.</h1></div>
          <p className="scope">Observe → interact → understand.<br />A deterministic pixel substrate; organism systems are planned.</p>
        </section>
        <div className="dashboard-grid">
          <section className="panel configuration" id="configuration" aria-labelledby="config-title" tabIndex={-1}>
            <p className="eyebrow">01 / MODEL</p>
            <h2 id="config-title">Experiment configuration</h2><p className="panel-description">Define the inputs. Prepare the world.</p>
            <form noValidate aria-describedby="feedback" onSubmit={(event) => {
              event.preventDefault();
              report(() => {
                const value = current();
                saveExperiment(localStore(), value);
                setMessage('Configuration saved in this browser. Export JSON for a portable copy.');
              });
            }}>
              <fieldset disabled={importing}>
                <label htmlFor="name">Experiment name</label>
                <input id="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                <label htmlFor="seed">Random seed</label>
                <input id="seed" type="number" min="0" max="4294967295" step="1" aria-describedby="seed-help" value={draft.seed} onChange={(e) => setDraft({ ...draft, seed: e.target.value })} />
                <p className="hint" id="seed-help">A whole number from 0 to 4294967295. Recorded for future reproducible runs.</p>
                <div className="dimensions">
                  <div><label htmlFor="width">Width (pixels)</label><input id="width" type="number" min="8" max="256" step="1" value={draft.width} onChange={(e) => setDraft({ ...draft, width: e.target.value })} /></div>
                  <div><label htmlFor="height">Height (pixels)</label><input id="height" type="number" min="8" max="256" step="1" value={draft.height} onChange={(e) => setDraft({ ...draft, height: e.target.value })} /></div>
                </div>
                <p className="hint">8–256 pixels per side. Invalid dimensions preview at 64 pixels.</p>
                <label htmlFor="genesis">Genesis mode <span className="label-note">planned simulation</span></label>
                <select id="genesis" value={draft.mode} onChange={(e) => setDraft({ ...draft, mode: e.target.value as Experiment['genesis']['mode'] })} aria-describedby="genesis-help">
                  <option value="primordial">Primordial</option><option value="seeded">Seeded</option>
                </select>
                <p className="hint" id="genesis-help">Primordial begins with environmental substrates; seeded begins with authored organisms. This selection records intent only.</p>
                <div className="actions">
                  <button type="submit" className="primary">Save locally</button>
                  <button type="button" onClick={() => report(() => {
                    const value = loadExperiment(localStore());
                    setDraft(makeDraft(value)); setMessage('Saved configuration loaded into the draft.');
                  })}>Load saved</button>
                  <button type="button" onClick={() => report(() => {
                    const text = serializeExperiment(current());
                    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
                    const anchor = document.createElement('a');
                    anchor.href = url; anchor.download = 'mathos-experiment.v1.json';
                    document.body.appendChild(anchor); anchor.click(); anchor.remove();
                    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
                    setMessage('JSON export requested. Keep the downloaded file as your portable copy.');
                  })}>Export JSON</button>
                  <button type="button" onClick={() => fileInput.current?.click()}>Import JSON</button>
                </div>
              </fieldset>
              <input className="file-input" ref={fileInput} type="file" accept=".json,application/json" aria-label="Import configuration file" tabIndex={-1} onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                e.currentTarget.value = '';
                if (file) void importFile(file);
              }} />
            </form>
            <p className="hint">Load and import replace the unsaved draft. Saving replaces the local configuration. Browser storage can be cleared; export a backup.</p>
            <p id="feedback" role="status" aria-live="polite" aria-atomic="true" className={`feedback ${error ? 'error' : ''}`}>{importing ? 'Reading configuration…' : message}</p>
          </section>
          <SubstrateControls getExperiment={current} preview={<PixelPreview width={previewDimension(draft.width)} height={previewDimension(draft.height)} />} onPrepared={() => setMobileView('universe')} onSetup={() => setMobileView('setup')} />
        </div>
        <nav className="mobile-navigation" aria-label="Mobile workspace">
          <button type="button" aria-pressed={mobileView === 'universe'} onClick={() => setMobileView('universe')}>Viewport</button>
          <button type="button" aria-pressed={mobileView === 'setup'} onClick={() => setMobileView('setup')}>Setup</button>
          <button type="button" aria-pressed={mobileView === 'inspect'} onClick={() => setMobileView('inspect')}>Inspect</button>
        </nav>
      </main>
      <footer><span>MATHOS / PHASE 1</span><span>Local by design. Portable by choice.</span></footer>
    </>
  );
}

export function App() {
  const [life, setLife] = useState(false);
  const [ecology, setEcology] = useState(() => new URLSearchParams(window.location.search).get('lab') !== 'reference');
  if (ecology) return <EcologyLab onExit={() => setEcology(false)} />;
  return life ? <LifeLab onExit={() => setLife(false)} /> : <ReferenceApp onEcology={() => { if (window.confirm('Leave this reference run and open the living world?')) setEcology(true); }} onLife={() => {
    if (window.confirm('Open the experimental life baseline? Any reference-substrate progress will be discarded.')) setLife(true);
  }} />;
}
