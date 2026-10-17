import { ORGAN_COLORS as COLORS } from '../rendering/organ-colors';
import { InheritanceComparison, RecentInheritedChanges } from './InheritanceComparison';
import {useEffect,useRef,useState} from 'react';
import {parseConfig,presetConfig,serializeConfig,validateConfig,needsRestart,PRESETS,PRESET_HELP,type Configuration,type Preset} from '../testfield/config';
import {parts,type World} from '../testfield/engine';
import {TestSession,metrics,type Edit} from '../testfield/session';
import {makeReport,reportText,type TestReport} from '../testfield/report';
import type {BodyPlan} from '../ecology/oriented-geometry';
declare const __MATHOS_SOURCE__:{revision:string;dirty:boolean};
function download(name:string,text:string){
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');
  a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function errorText(cause:unknown){return cause instanceof Error?cause.message:'The operation failed.';}
export function TestFieldLab({onExit,active}:{onExit:()=>void;active:boolean}){
  const [session,setSession]=useState(()=>new TestSession(presetConfig('feeding')));
  const [world,setWorld]=useState(()=>session.snapshot()),[draft,setDraft]=useState(()=>world.definition);
  const [json,setJson]=useState(()=>serializeConfig(draft)),[showJson,setShowJson]=useState(false),[jsonError,setJsonError]=useState('');
  const [running,setRunning]=useState(false),[rate,setRate]=useState(10),[view,setView]=useState<'field'|'controls'|'results'>('field');
  const [tool,setTool]=useState<'select'|'food'|'add'|'erase'>('select'),[point,setPoint]=useState({x:10,y:10});
  const [selected,setSelected]=useState(1),[plan,setPlan]=useState<BodyPlan>('grazer'),[direction,setDirection]=useState(1);
  const [message,setMessage]=useState('Choose a prepared test, then Run. Results can be copied here for review.');
  const [notes,setNotes]=useState(''),[copiedReport,setCopiedReport]=useState(''),[busy,setBusy]=useState(false);
  const canvas=useRef<HTMLCanvasElement>(null),file=useRef<HTMLInputElement>(null),fallback=useRef<HTMLTextAreaElement>(null);
  const importEpoch=useRef(0);
  const refresh=()=>setWorld(session.snapshot());
  const fail=(cause:unknown)=>{const message=errorText(cause);session.recordError(message);setMessage(message);};
  const action=(work:()=>void)=>{try{work();refresh();}catch(cause){fail(cause);}};
  function changeDraft(next:Configuration){setDraft(next);setJson(JSON.stringify(next,null,2)+'\n');setJsonError('');}
  function prepare(config=draft){
    try{
      const valid=validateConfig(config);importEpoch.current++;setRunning(false);const next=new TestSession(valid);setSession(next);
      changeDraft(valid);setWorld(next.snapshot());setSelected(1);setNotes('');setCopiedReport('');setMessage('Prepared at step0. Run to the chosen limit, or edit and step.');setView('field');
    }catch(cause){fail(cause);}
  }
  let draftError='';try{validateConfig(draft);}catch(cause){draftError=errorText(cause);}
  const restart=needsRestart(world.definition,draft),m=metrics(world),complete=session.complete;
  const creature=world.creatures.find(c=>c.id===selected),edited=session.editCount;
  useEffect(()=>{
    if(!running||!active)return;
    let request=0,cancelled=false,last:number|null=null,debt=0;
    const frame=(time:number)=>{
      if(cancelled)return;
      const interval=1000/rate;debt=Math.min(debt+Math.max(0,time-(last??time)),interval*8);last=time;
      const start=performance.now();let count=0;
      try{
        while(debt>=interval&&count<8&&!session.complete){session.advance();debt-=interval;count++;if(performance.now()-start>=8)break;}
        if(count)setWorld(session.snapshot());
        if(session.complete){setRunning(false);setMessage('Test complete. Review the results, add your observations, then Copy test report.');return;}
      }catch(cause){setRunning(false);setMessage(errorText(cause));setWorld(session.snapshot());return;}
      request=requestAnimationFrame(frame);
    };
    request=requestAnimationFrame(frame);return()=>{cancelled=true;cancelAnimationFrame(request);};
  },[running,rate,active,session]);
  useEffect(()=>{const hidden=()=>{if(document.hidden)setRunning(false);};document.addEventListener('visibilitychange',hidden);return()=>document.removeEventListener('visibilitychange',hidden);},[]);
  useEffect(()=>{
    const c=canvas.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;
    const {width,height}=world.definition.world;c.width=width*16;c.height=height*16;ctx.fillStyle='#050e09';ctx.fillRect(0,0,c.width,c.height);
    ctx.strokeStyle='#132d22';ctx.lineWidth=1;
    for(let x=0;x<=width;x++){ctx.beginPath();ctx.moveTo(x*16+.5,0);ctx.lineTo(x*16+.5,c.height);ctx.stroke();}
    for(let y=0;y<=height;y++){ctx.beginPath();ctx.moveTo(0,y*16+.5);ctx.lineTo(c.width,y*16+.5);ctx.stroke();}
    world.food.forEach((amount,i)=>{if(amount){ctx.fillStyle='#79d95c';ctx.fillRect(i%width*16+6,Math.floor(i/width)*16+6,4,4);}});
    for(const organism of world.creatures)for(const p of parts(organism)){
      ctx.fillStyle=COLORS[p.role];ctx.fillRect(p.x*16+2,p.y*16+2,12,12);
      if(organism.id===selected){ctx.strokeStyle='#55ddf3';ctx.strokeRect(p.x*16+.5,p.y*16+.5,15,15);}
    }
    ctx.strokeStyle='#e0eaf5';ctx.strokeRect(point.x*16+1,point.y*16+1,14,14);
  },[world,selected,point]);
  useEffect(()=>{
    const field=canvas.current,dock=document.querySelector('.test-playback');if(!field||!dock)return;
    const fit=()=>{
      if(innerWidth>900){field.style.width='100%';return;}
      if(!field.getClientRects().length)return;
      const available=Math.max(24,dock.getBoundingClientRect().top-field.getBoundingClientRect().top-10);
      const parent=field.parentElement!;
      const css=getComputedStyle(parent),width=parent.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
      field.style.width=`${Math.floor(Math.min(width,available*world.definition.world.width/world.definition.world.height))}px`;
      field.style.marginInline='auto';
    };
    fit();const observer=new ResizeObserver(fit);observer.observe(dock);window.addEventListener('resize',fit);
    return()=>{observer.disconnect();window.removeEventListener('resize',fit);};
  },[view,active,world.definition.world.width,world.definition.world.height]);
  function edit(payload:Omit<Edit,'tick'>){action(()=>{session.edit({tick:session.tick,...payload});setMessage(`Edit applied before step${world.tick+1}. It is included in the replay report.`);});}
  function applyTool(x:number,y:number){
    setPoint({x,y});
    if(tool==='select'){setSelected(world.creatures.find(c=>parts(c).some(p=>p.x===x&&p.y===y))?.id??0);return;}
    action(()=>{session.edit({tick:session.tick,kind:tool,x,y,...(tool==='add'?{direction,bodyPlan:plan}:{})});setMessage(`Applied ${tool} at (${x},${y}); report updated.`);});
  }
  function applyLive(){action(()=>{session.edit({tick:session.tick,kind:'config',config:parseConfig(json)});setMessage(`Settings applied before step${session.tick+1}; recorded for replay.`);});}
  async function createReport(copy:boolean){
    setBusy(true);
    try{
      const report=await makeReport(session,{source:{...__MATHOS_SOURCE__},browser:navigator.userAgent,viewport:{width:innerWidth,height:innerHeight}},running,notes);
      if(!copy){download('mathos-test-report.v1.json',JSON.stringify(report,null,2)+'\n');setMessage('Test report download requested. It includes the reproducible test recipe.');return;}
      const text=reportText(report);setCopiedReport(text);
      try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable.');await navigator.clipboard.writeText(text);setMessage('Test report copied. Paste the whole report into this chat for review.');}
      catch{setMessage('Clipboard unavailable. Select and copy the report text below.');setView('results');setTimeout(()=>{fallback.current?.focus();fallback.current?.select();},0);}
    }catch(cause){fail(cause);}finally{setBusy(false);}
  }
  function numeric(label:string,value:number,min:number,max:number,onChange:(n:number)=>void){return <label>{label}<input type="number" min={min} max={max} step="1" value={Number.isFinite(value)?value:''} onChange={e=>onChange(e.target.value===''?NaN:Number(e.target.value))}/></label>;}
  function navigate(next:typeof view){setView(next);window.scrollTo(0,0);}
  return <>
    <header className="masthead test-masthead"><div className="wordmark">MATHOS <small>CONTROLLED TEST FIELD</small></div><nav aria-label="Laboratory"><button onClick={()=>{setRunning(false);onExit();}}>Living world</button><span aria-current="page">Test field</span></nav><span className="local-badge">LOCAL ONLY</span></header>
    <main className="test-lab" data-view={view} data-json={showJson}>
      <section className="test-intro"><div><p className="eyebrow">PREPARE → TRY → COPY RESULTS</p><h1>Control a small test. Share what happened.</h1></div><p>1 Choose a scenario · 2 Run or edit · 3 Copy test report</p></section>
      <section className="test-playback panel" aria-label="Test playback">
        <button className="primary" aria-label={running?'Pause test':'Run prepared test'} disabled={complete||Boolean(session.failure)} onClick={()=>setRunning(!running)}><span className="test-wide-label">{running?'Pause test':'Run prepared test'}</span><span className="test-short-label">{running?'Pause':'Run'}</span></button>
        <button aria-label="One test step" disabled={running||complete} onClick={()=>action(()=>session.advance())}><span className="test-wide-label">One test step</span><span className="test-short-label">Step</span></button>
        <button aria-label="Reset test" onClick={()=>prepare(session.initial)}>Reset</button>
        <label><span className="test-wide-label">Playback speed</span><span className="test-short-label">Speed</span><select aria-label="Playback speed" value={rate} onChange={e=>setRate(Number(e.target.value))}><option value="1">1 step/s</option><option value="10">10 steps/s</option><option value="30">30 steps/s</option></select></label>
        <strong data-testid="test-field-progress">{world.tick} / {world.definition.test.steps} steps</strong><span>{session.failure?'Error':complete?'Complete':running?'Running':'Paused'}{edited?' · Edited test':''}</span>
      </section>
      <div className="test-layout">
        <section className="panel test-controls" aria-labelledby="test-controls-title"><h2 id="test-controls-title">Quick controls</h2><button className="test-phone-json" aria-expanded={showJson} aria-controls="test-json-panel" onClick={()=>setShowJson(!showJson)}>{showJson?'Hide JSON':'Show JSON'}</button>
          <label>Prepared scenario<select aria-label="Prepared scenario" disabled={Boolean(jsonError)} value={draft.test.preset} onChange={e=>changeDraft(presetConfig(e.target.value as Preset))}>{PRESETS.map(p=><option key={p} value={p}>{p==='feeding'?'Movement & feeding':p==='growth'?'Growth & learning':p==='inheritance'?'Reproduction & inheritance':'Empty field'}</option>)}</select></label>
          <p className="hint">{PRESET_HELP[draft.test.preset]}</p>
          <fieldset disabled={Boolean(jsonError)}><legend>World · reset required</legend>
            {numeric('Test seed',draft.seed,0,4294967295,seed=>changeDraft({...draft,seed}))}
            <div className="test-pair">{numeric('Field width',draft.world.width,16,64,width=>changeDraft({...draft,world:{...draft.world,width}}))}{numeric('Field height',draft.world.height,16,48,height=>changeDraft({...draft,world:{...draft.world,height}}))}</div>
          </fieldset>
          <fieldset disabled={Boolean(jsonError)}><legend>Live-safe settings</legend>
            {numeric('Food energy per new patch',draft.rules.foodEnergy,1,96,foodEnergy=>changeDraft({...draft,rules:{...draft.rules,foodEnergy}}))}
            {numeric('Food spawn attempts per step',draft.rules.sunlight,0,8,sunlight=>changeDraft({...draft,rules:{...draft.rules,sunlight}}))}
            {numeric('Upkeep per body cell',draft.rules.upkeep,1,3,upkeep=>changeDraft({...draft,rules:{...draft.rules,upkeep}}))}
            {numeric('Energy for new organisms',draft.organisms.startingEnergy,40,300,startingEnergy=>changeDraft({...draft,organisms:{...draft.organisms,startingEnergy}}))}
            <label className="test-toggle"><input type="checkbox" checked={draft.organisms.learning} onChange={e=>changeDraft({...draft,organisms:{...draft.organisms,learning:e.target.checked}})}/>Learning</label>
            <label className="test-toggle"><input type="checkbox" checked={draft.organisms.structuralMutation} onChange={e=>changeDraft({...draft,organisms:{...draft.organisms,structuralMutation:e.target.checked}})}/>Body mutation</label>
            {numeric('Test step limit',draft.test.steps,1,1600,steps=>changeDraft({...draft,test:{...draft.test,steps}}))}
          </fieldset>
          <p className="hint">New-energy and food settings affect new additions. Learning off freezes weights; it does not erase past updates.</p>
          <button className="primary" disabled={Boolean(jsonError||draftError)||restart} onClick={applyLive}>Apply live settings</button>
          <button disabled={Boolean(jsonError||draftError)} onClick={()=>prepare(parseConfig(json))}>Prepare test · reset field</button>
          <button onClick={()=>changeDraft(world.definition)}>Revert draft</button>
          <p className="hint">{jsonError||draftError|| (restart?'Seed, dimensions or scenario changed: Prepare test will reset.':'Changes apply at a recorded boundary before the next step.')}</p>
          <div className="test-files"><button onClick={()=>file.current?.click()}>Open JSON file</button><button onClick={()=>{try{download('mathos-test-field.v1.json',serializeConfig(parseConfig(json)));}catch(cause){fail(cause);}}}>Save JSON file</button>
            <button onClick={()=>{try{localStorage.setItem('mathos.test-field.v1',serializeConfig(parseConfig(json)));setMessage('Configuration saved in this browser.');}catch(cause){fail(cause);}}}>Save in browser</button>
            <button onClick={()=>{try{const text=localStorage.getItem('mathos.test-field.v1');if(text===null)throw Error('No saved test configuration.');changeDraft(parseConfig(text));setMessage('Saved configuration loaded as a draft.');}catch(cause){fail(cause);}}}>Load saved</button></div>
          <input className="file-input" type="file" ref={file} accept=".json,application/json" aria-label="Import test configuration file" onChange={async e=>{const f=e.target.files?.[0];e.target.value='';if(!f)return;const token=++importEpoch.current;try{if(f.size>65536)throw Error('Configuration exceeds64KiB.');const c=parseConfig(await f.text());if(token===importEpoch.current){changeDraft(c);setMessage('JSON imported as a draft; active test unchanged.');}}catch(cause){if(token===importEpoch.current)fail(cause);}}}/>
        </section>
        <section className="panel test-field" aria-labelledby="test-field-title"><div className="test-title-row"><h2 id="test-field-title">Test field</h2><button aria-expanded={showJson} aria-controls="test-json-panel" onClick={()=>setShowJson(!showJson)}>{showJson?'Hide JSON':'Show JSON'}</button></div>
          <div className="test-tools" role="group" aria-label="Field tools">{(['select','food','add','erase'] as const).map(t=><button key={t} aria-pressed={tool===t} onClick={()=>setTool(t)}>{t==='food'?'Add food':t==='add'?'Add organism':t==='erase'?'Erase':'Select'}</button>)}</div>
          <canvas ref={canvas} tabIndex={0} role="img" aria-label="Editable test field" aria-describedby="test-field-help" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();applyTool(Math.min(world.definition.world.width-1,Math.max(0,Math.floor((e.clientX-r.left)/r.width*world.definition.world.width))),Math.min(world.definition.world.height-1,Math.max(0,Math.floor((e.clientY-r.top)/r.height*world.definition.world.height))));}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();applyTool(point.x,point.y);}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setPoint(p=>({x:Math.max(0,Math.min(world.definition.world.width-1,p.x+(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0))),y:Math.max(0,Math.min(world.definition.world.height-1,p.y+(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0)))}));}}}/>
          <p id="test-field-help" className="hint">Tap a cell to use the chosen tool. Keyboard: arrows move the cursor, Enter applies. Coordinates below offer the same tools without Canvas.</p>
          <div className="test-coordinates">{numeric('Cell X',point.x,0,world.definition.world.width-1,x=>setPoint({...point,x}))}{numeric('Cell Y',point.y,0,world.definition.world.height-1,y=>setPoint({...point,y}))}<button onClick={()=>applyTool(point.x,point.y)}>Use tool at coordinates</button></div>
          <details><summary>Organism placement</summary><label>Body preset<select aria-label="Body preset" value={plan} onChange={e=>setPlan(e.target.value as BodyPlan)}><option>dart</option><option>grazer</option><option>scout</option></select></label><label>Placement heading<select aria-label="Placement heading" value={direction} onChange={e=>setDirection(Number(e.target.value))}>{['North','East','South','West'].map((d,i)=><option key={d} value={i}>{d}</option>)}</select></label></details>
          <div className="test-tools"><button disabled={!session.canUndo} onClick={()=>action(()=>session.undo())}>Undo last edit</button><button onClick={()=>edit({kind:'clear'})}>Clear field</button><button onClick={()=>prepare(session.initial)}>Restore prepared setup</button></div>
          <div className="test-selection"><label>Inspect organism<select aria-label="Inspect organism" value={creature?.id??0} onChange={e=>setSelected(Number(e.target.value))}><option value="0">None selected</option>{world.creatures.map(c=><option key={c.id} value={c.id}>Organism #{c.id}</option>)}</select></label>
            {creature&&<><p>#{creature.id} · {['North','East','South','West'][creature.direction]} · energy {creature.energy} · {creature.size}/{creature.genes.layout.length} cells</p><p>{creature.action}</p><p className="hint">Updates {creature.controller.updates} · last reward {creature.lastDecision?.reward??'not yet measured'}</p>
              <button onClick={()=>action(()=>session.edit({tick:session.tick,kind:'rotate',id:creature.id,turn:'left'}))}>Rotate left</button><button onClick={()=>action(()=>session.edit({tick:session.tick,kind:'rotate',id:creature.id,turn:'right'}))}>Rotate right</button></>}
          </div>
        </section>
        {showJson&&<section className="panel test-json" id="test-json-panel"><h2>Configuration JSON</h2><p className="hint">Draft only. Valid JSON updates the controls; Apply changes the active test.</p><label>Editable configuration JSON<textarea aria-label="Editable configuration JSON" spellCheck={false} value={json} onChange={e=>{setJson(e.target.value);try{const c=parseConfig(e.target.value);setDraft(c);setJsonError('');}catch(cause){setJsonError(errorText(cause));}}}/></label><p role="status">{jsonError||draftError||'Valid configuration'}</p><button className="primary" disabled={Boolean(jsonError||draftError)||restart} onClick={applyLive}>Apply JSON settings</button><button onClick={()=>changeDraft(world.definition)}>Revert JSON draft</button><button onClick={()=>setShowJson(false)}>Hide JSON editor</button></section>}
        <section className="panel test-results" aria-labelledby="test-results-title"><h2 id="test-results-title">Test results & handoff</h2>
          <div className="test-metrics">{[['Organisms',m.population],['Births',m.births],['Deaths',m.deaths],['Food intake',m.intake],['Learning updates',m.updates],['Body changes',m.acceptedChanges]].map(([label,value])=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
          <p><strong>Resource check: {m.exact?'exact':'FAILED'}</strong> · {m.supplied} supplied / {m.accounted} accounted</p><p className="hint">Authored additions/removals are counted separately. More survivors or updates alone do not prove better learning.</p>
          <label>My observations<textarea aria-label="My observations" maxLength={2000} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="What looked wrong, or what would you like me to investigate?"/></label>
          <div className="test-tools"><button className="primary" disabled={busy} onClick={()=>void createReport(true)}>Copy test report</button><button disabled={busy} onClick={()=>void createReport(false)}>Save test report</button></div>
          <p className="hint">Paste the whole copied report into this chat, or attach the JSON file. It includes settings, edits, actual results, errors and replay details.</p>
          {copiedReport&&<label>Report text · select and copy<textarea aria-label="Report text · select and copy" ref={fallback} readOnly value={copiedReport} onFocus={e=>e.target.select()}/></label>}
          <RecentInheritedChanges world={world} inspect={setSelected} />
          <label>Compare inherited organism<select aria-label="Compare inherited organism" value={world.lineage.some(l=>l.id===selected)?selected:''} onChange={e=>setSelected(Number(e.target.value))}><option value="" disabled>Select a recorded organism</option>{world.lineage.map(l=><option key={l.id} value={l.id}>#{l.id} · generation {l.generation}{l.died===null?'':' · died'}</option>)}</select></label>
          <InheritanceComparison world={world} selected={selected} />
          <svg className="test-history" viewBox="0 0 600 130" role="img" aria-label="Sampled population over test steps"><title>Population from0 to48; step0 through the current test</title><path d="M25 5 V110 H590" fill="none" stroke="#5c7185"/><text x="0" y="12" fill="#b4c7dc" fontSize="12">48</text><text x="8" y="110" fill="#b4c7dc" fontSize="12">0</text><polyline fill="none" stroke="#7ed5bb" strokeWidth="2" points={world.history.map(s=>`${25+s.tick/Math.max(1,world.tick)*565},${110-s.population/48*100}`).join(' ')}/></svg>
          <details><summary>Detailed analytics</summary><dl>{Object.entries(m).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}</dl><table><caption>Sampled population history · every20 steps</caption><thead><tr><th>Step</th><th>Population</th><th>Food sites</th></tr></thead><tbody>{world.history.map(s=><tr key={s.tick}><td>{s.tick}</td><td>{s.population}</td><td>{s.pellets}</td></tr>)}</tbody></table></details>
        </section>
      </div>
      <p role="status" className="feedback test-feedback">{busy?'Preparing reproducible report…':message}</p>
      <nav className="test-mobile-nav" aria-label="Test field views">{(['field','controls','results'] as const).map(v=><button key={v} aria-pressed={view===v} onClick={()=>navigate(v)}>{v==='field'?'Field':v==='controls'?'Controls':'Results'}</button>)}</nav>
    </main>
  </>;
}
export type {TestReport,World};
