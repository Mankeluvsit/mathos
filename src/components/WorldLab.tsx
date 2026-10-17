import {PRESENTATION, PRESENTATION_STYLE} from '../design/presentation';
import {drawOrganGlyph} from '../rendering/organ-glyph';
import { ORGAN_COLORS as COLORS } from '../rendering/organ-colors';
import { InheritanceComparison, RecentInheritedChanges } from './InheritanceComparison';
import {useEffect,useRef,useState} from 'react';
import {parseConfig,presetConfig,serializeConfig,validateConfig,needsRestart,PRESETS,PRESET_HELP,type Configuration,type Preset} from '../world/config';
import {parts,type World} from '../world/engine';
import {TestSession,metrics,type Edit} from '../world/session';
import {makeReport,reportText,type TestReport} from '../world/report';
import type {BodyPlan} from '../ecology/oriented-geometry';
declare const __MATHOS_SOURCE__:{revision:string;dirty:boolean};
function download(name:string,text:string){
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');
  a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function errorText(cause:unknown){return cause instanceof Error?cause.message:'The operation failed.';}
export function WorldLab(){
  const active=true;
  const [appearance,setAppearance]=useState<'terminal'|'classic'>('terminal');
  const [testing,setTesting]=useState(false);
  const [worldOnly,setWorldOnly]=useState(false),[contextOpen,setContextOpen]=useState(true);
  const viewToggle=useRef<HTMLButtonElement>(null),previousWorldOnly=useRef(false);
  const [session,setSession]=useState(()=>new TestSession(presetConfig('neutral')));
  const [world,setWorld]=useState(()=>session.snapshot()),[draft,setDraft]=useState(()=>world.definition);
  const [json,setJson]=useState(()=>serializeConfig(draft)),[showJson,setShowJson]=useState(false),[jsonError,setJsonError]=useState('');
  const [running,setRunning]=useState(false),[rate,setRate]=useState(10),[view,setView]=useState<'field'|'controls'|'results'>('field');
  const [tool,setTool]=useState<'select'|'food'|'add'|'erase'>('select'),[point,setPoint]=useState({x:10,y:10});
  const [selected,setSelected]=useState(1),[plan,setPlan]=useState<BodyPlan>('grazer'),[direction,setDirection]=useState(1);
  const [message,setMessage]=useState('One world, one set of rules. Configure it, then Start. Testing tools use this same run.');
  const [notes,setNotes]=useState(''),[copiedReport,setCopiedReport]=useState(''),[busy,setBusy]=useState(false);
  const canvas=useRef<HTMLCanvasElement>(null),file=useRef<HTMLInputElement>(null),fallback=useRef<HTMLTextAreaElement>(null);
  const importEpoch=useRef(0);
  const refresh=()=>setWorld(session.snapshot());
  const fail=(cause:unknown)=>{const message=errorText(cause);session.recordError(message);setMessage(message);};
  const action=(work:()=>void)=>{try{work();refresh();}catch(cause){fail(cause);}};
  function changeDraft(next:Configuration){setDraft(next);setJson(JSON.stringify(next,null,2)+'\n');setJsonError('');}
  function prepare(config=draft){
    try{
      if((session.tick>0||session.editCount>0)&&!window.confirm('Prepare a new world and discard this run? Save a report first if needed.'))return;
      const valid=validateConfig(config);importEpoch.current++;setRunning(false);const next=new TestSession(valid);setSession(next);
      changeDraft(valid);setWorld(next.snapshot());setSelected(1);setNotes('');setCopiedReport('');setMessage('Prepared at step0. Start the world; testing tools act on this same run.');setView('field');
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
        if(session.complete){setRunning(false);setMessage('Chosen stopping step reached. Review results or change the stopping rule to continue.');return;}
      }catch(cause){setRunning(false);setMessage(errorText(cause));setWorld(session.snapshot());return;}
      request=requestAnimationFrame(frame);
    };
    request=requestAnimationFrame(frame);return()=>{cancelled=true;cancelAnimationFrame(request);};
  },[running,rate,active,session]);
  useEffect(()=>{const hidden=()=>{if(document.hidden)setRunning(false);};document.addEventListener('visibilitychange',hidden);return()=>document.removeEventListener('visibilitychange',hidden);},[]);
  useEffect(()=>{
    const c=canvas.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;
    const {width,height}=world.definition.world;c.width=width*16;c.height=height*16;ctx.fillStyle=PRESENTATION.world.background;ctx.fillRect(0,0,c.width,c.height);
    ctx.strokeStyle=PRESENTATION.world.grid;ctx.lineWidth=1;
    for(let x=0;x<=width;x++){ctx.beginPath();ctx.moveTo(x*16+.5,0);ctx.lineTo(x*16+.5,c.height);ctx.stroke();}
    for(let y=0;y<=height;y++){ctx.beginPath();ctx.moveTo(0,y*16+.5);ctx.lineTo(c.width,y*16+.5);ctx.stroke();}
    world.food.forEach((amount,i)=>{if(amount){ctx.fillStyle=PRESENTATION.world.food;ctx.fillRect(i%width*16+6,Math.floor(i/width)*16+6,4,4);}});
    for(const organism of world.creatures)for(const p of parts(organism)){
      if(appearance==='classic'){ctx.fillStyle=COLORS[p.role];ctx.fillRect(p.x*16+2,p.y*16+2,12,12);}else{ctx.strokeStyle=PRESENTATION.world.bodyOutline;ctx.strokeRect(p.x*16+.5,p.y*16+.5,15,15);drawOrganGlyph(ctx,p.role,organism.direction,p.x*16+8,p.y*16+8,1.2);}
      if(organism.id===selected){ctx.strokeStyle=PRESENTATION.world.selection;ctx.strokeRect(p.x*16+.5,p.y*16+.5,15,15);}
    }
    ctx.strokeStyle=PRESENTATION.world.cursor;ctx.strokeRect(point.x*16+1,point.y*16+1,14,14);
  },[world,selected,point,appearance]);
  useEffect(()=>{
    const field=canvas.current,dock=document.querySelector('.test-playback');if(!field||!dock)return;
    const fit=()=>{
      if(innerWidth>900&&!worldOnly){field.style.width='100%';return;}
      if(!field.getClientRects().length)return;
      const available=Math.max(24,dock.getBoundingClientRect().top-field.getBoundingClientRect().top-(worldOnly?140:10));
      const parent=field.parentElement!;
      const css=getComputedStyle(parent),width=parent.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
      field.style.width=`${Math.floor(Math.min(width,available*world.definition.world.width/world.definition.world.height))}px`;
      field.style.marginInline='auto';
    };
    fit();const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(fit);observer?.observe(dock);window.addEventListener('resize',fit);
    return()=>{observer?.disconnect();window.removeEventListener('resize',fit);};
  },[view,active,worldOnly,world.definition.world.width,world.definition.world.height]);
  function setPresentation(only:boolean){
    setWorldOnly(only);setView('field');setContextOpen(!only);window.scrollTo(0,0);
  }
  useEffect(()=>{
    if(worldOnly)canvas.current?.focus({preventScroll:true});
    else if(previousWorldOnly.current)viewToggle.current?.focus({preventScroll:true});
    previousWorldOnly.current=worldOnly;
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&worldOnly){event.preventDefault();setWorldOnly(false);setContextOpen(true);}};
    document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);
  },[worldOnly]);
  function edit(payload:Omit<Edit,'tick'>){action(()=>{session.edit({tick:session.tick,...payload});setMessage(`Edit applied before step${world.tick+1}. It is included in the replay report.`);});}
  function applyTool(x:number,y:number){
    setPoint({x,y});
    if(!testing||tool==='select'){setSelected(world.creatures.find(c=>parts(c).some(p=>p.x===x&&p.y===y))?.id??0);return;}
    action(()=>{session.edit({tick:session.tick,kind:tool,x,y,...(tool==='add'?{direction,bodyPlan:plan}:{})});setMessage(`Applied ${tool} at (${x},${y}); report updated.`);});
  }
  function applyLive(){action(()=>{session.edit({tick:session.tick,kind:'config',config:parseConfig(json)});setMessage(`Settings applied before step${session.tick+1}; recorded for replay.`);});}
  async function createReport(copy:boolean){
    setBusy(true);
    try{
      const report=await makeReport(session,{source:{...__MATHOS_SOURCE__},browser:navigator.userAgent,viewport:{width:innerWidth,height:innerHeight}},running,notes);
      if(!copy){download('mathos-world-report.v1.json',JSON.stringify(report,null,2)+'\n');setMessage('Test report download requested. It includes the reproducible test recipe.');return;}
      const text=reportText(report);setCopiedReport(text);
      try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable.');await navigator.clipboard.writeText(text);setMessage('Test report copied. Paste the whole report into this chat for review.');}
      catch{setMessage('Clipboard unavailable. Select and copy the report text below.');setView('results');setTimeout(()=>{fallback.current?.focus();fallback.current?.select();},0);}
    }catch(cause){fail(cause);}finally{setBusy(false);}
  }
  function numeric(label:string,value:number,min:number,max:number,onChange:(n:number)=>void){return <label>{label}<input type="number" min={min} max={max} step="1" value={Number.isFinite(value)?value:''} onChange={e=>onChange(e.target.value===''?NaN:Number(e.target.value))}/></label>;}
  function navigate(next:typeof view){setView(next);window.scrollTo(0,0);}
  return <div className="mathos-shell" style={PRESENTATION_STYLE} data-world-only={worldOnly}>
    <header hidden={worldOnly} className="masthead test-masthead"><div className="wordmark">MATHOS <small>ONE CONFIGURABLE WORLD</small></div><label className="world-test-switch"><input type="checkbox" checked={testing} onChange={e=>{setTesting(e.target.checked);setTool('select');}}/>Testing tools · same world</label><span className="local-badge">LOCAL ONLY</span></header>
    <main className="test-lab world-lab" data-view={view} data-json={showJson}>
      <section hidden={worldOnly} className="test-intro"><div><p className="eyebrow">PREPARE → TRY → COPY RESULTS</p><h1>Configure the world. Test its rules.</h1></div><p>One active run · explicit limits · shared test tools</p></section>
      <section className="test-playback panel" aria-label="World playback">
        <button className="primary" aria-label={running?'Pause world':'Start world'} disabled={complete||Boolean(session.failure)} onClick={()=>setRunning(!running)}><span className="test-wide-label">{running?'Pause world':'Start world'}</span><span className="test-short-label">{running?'Pause':'Run'}</span></button>
        <button aria-label="One world step" disabled={running||complete} onClick={()=>action(()=>session.advance())}><span className="test-wide-label">One world step</span><span className="test-short-label">Step</span></button>
        <button aria-label="Reset world" onClick={()=>prepare(session.initial)}>Reset</button>
        <label><span className="test-wide-label">Playback speed</span><span className="test-short-label">Speed</span><select aria-label="Playback speed" value={rate} onChange={e=>setRate(Number(e.target.value))}><option value="1">1 step/s</option><option value="10">10 steps/s</option><option value="30">30 steps/s</option></select></label>
        <strong data-testid="test-field-progress">{world.tick} / {world.definition.test.steps??'until paused'} steps</strong><span>{session.failure?'Error':complete?'Complete':running?'Running':'Paused'}{edited?' · Recorded changes':''}</span>
      </section>
      <div className="test-layout">
        <section hidden={worldOnly} className="panel test-controls" aria-labelledby="test-controls-title"><h2 id="test-controls-title">World rules</h2><p className="hint">Edit the draft, then Apply. Starting conditions require Prepare. Testing tools use this same world.</p><button className="test-phone-json" aria-expanded={showJson} aria-controls="test-json-panel" onClick={()=>setShowJson(!showJson)}>{showJson?'Hide JSON':'Show JSON'}</button>
          <label>Starting profile<select aria-label="Starting profile" disabled={Boolean(jsonError)} value={draft.test.preset} onChange={e=>changeDraft(presetConfig(e.target.value as Preset))}>{PRESETS.map(p=><option key={p} value={p}>{p==='neutral'?'Neutral starting profile':p==='feeding'?'Demo: feeding':p==='growth'?'Demo: growth':p==='inheritance'?'Demo: reproduction':'Empty field'}</option>)}</select></label>
          <p className="hint">{PRESET_HELP[draft.test.preset]}</p>
          <fieldset disabled={Boolean(jsonError)}><legend>World · reset required</legend>
            {numeric('World seed',draft.seed,0,4294967295,seed=>changeDraft({...draft,seed}))}
            <div className="test-pair">{numeric('World width',draft.world.width,16,64,width=>changeDraft({...draft,world:{...draft.world,width}}))}{numeric('World height',draft.world.height,16,48,height=>changeDraft({...draft,world:{...draft.world,height}}))}</div>
            {numeric('Initial food target · patches',draft.rules.initialFood,0,draft.world.width*draft.world.height,initialFood=>changeDraft({...draft,rules:{...draft.rules,initialFood}}))}
            {numeric('Starting organisms',draft.organisms.count,0,8,count=>changeDraft({...draft,organisms:{...draft.organisms,count}}))}
            <label>Starting body<select aria-label="Starting body" value={draft.organisms.bodyPlan} onChange={e=>changeDraft({...draft,organisms:{...draft.organisms,bodyPlan:e.target.value as BodyPlan}})}><option>dart</option><option>grazer</option><option>scout</option></select></label>
          </fieldset>
          <fieldset disabled={Boolean(jsonError)}><legend>Live-safe settings</legend>
            {numeric('Food energy per new patch',draft.rules.foodEnergy,1,96,foodEnergy=>changeDraft({...draft,rules:{...draft.rules,foodEnergy}}))}
            <label className="test-toggle"><input type="checkbox" checked={draft.rules.replenishment} onChange={e=>changeDraft({...draft,rules:{...draft.rules,replenishment:e.target.checked}})}/>Replenish food</label>
            <label className="test-toggle"><input type="checkbox" checked={draft.rules.foodCap!==null} onChange={e=>changeDraft({...draft,rules:{...draft.rules,foodCap:e.target.checked?4096:null}})}/>Cap available food energy</label>
            {draft.rules.foodCap!==null&&numeric('Available food cap · energy',draft.rules.foodCap,0,294912,foodCap=>changeDraft({...draft,rules:{...draft.rules,foodCap}}))}
            <label className="test-toggle"><input type="checkbox" checked={draft.rules.supplyBudget!==null} onChange={e=>changeDraft({...draft,rules:{...draft.rules,supplyBudget:e.target.checked?Math.max(12000,world.sunlight):null}})}/>Limit total replenishment</label>
            {draft.rules.supplyBudget!==null&&numeric('Replenishment budget · energy',draft.rules.supplyBudget,0,1000000000,supplyBudget=>changeDraft({...draft,rules:{...draft.rules,supplyBudget}}))}
            {numeric('Food spawn attempts per step',draft.rules.spawnAttempts,0,8,spawnAttempts=>changeDraft({...draft,rules:{...draft.rules,spawnAttempts}}))}
            {numeric('Upkeep per body cell',draft.rules.upkeep,1,3,upkeep=>changeDraft({...draft,rules:{...draft.rules,upkeep}}))}
            {numeric('Founder / added organism energy',draft.organisms.startingEnergy,40,300,startingEnergy=>changeDraft({...draft,organisms:{...draft.organisms,startingEnergy}}))}
            <label className="test-toggle"><input type="checkbox" checked={draft.organisms.learning} onChange={e=>changeDraft({...draft,organisms:{...draft.organisms,learning:e.target.checked}})}/>Learning</label>
            <label className="test-toggle"><input type="checkbox" checked={draft.organisms.structuralMutation} onChange={e=>changeDraft({...draft,organisms:{...draft.organisms,structuralMutation:e.target.checked}})}/>Body mutation</label>
            {(['reproduction','traitMutation','inheritBody','inheritTraits','inheritWeights'] as const).map(key=><label className="test-toggle" key={key}><input type="checkbox" checked={draft.organisms[key]} onChange={e=>changeDraft({...draft,organisms:{...draft.organisms,[key]:e.target.checked}})}/>{{reproduction:'Reproduction',traitMutation:'Scalar trait mutation',inheritBody:'Offspring inherit body layout',inheritTraits:'Offspring inherit scalar traits',inheritWeights:'Offspring inherit controller weights · experimental'}[key]}</label>)}
            <label className="test-toggle"><input type="checkbox" checked={draft.test.steps!==null} onChange={e=>changeDraft({...draft,test:{...draft.test,steps:e.target.checked?Math.max(1600,world.tick+1):null}})}/>Stop at chosen step</label>
            {draft.test.steps!==null&&numeric('Stopping step',draft.test.steps,1,1000000000,steps=>changeDraft({...draft,test:{...draft.test,steps}}))}
            <p className="hint">Stop off = run until paused. Food cap includes partial patches and initial/manual food. Supply budget counts only automatic replenishment. No food is silently removed when a limit changes.</p>
            <p className="hint">Inheritance off resets that material to the configured founder baseline. Mutation is separate. Copied controller weights are deep-copied at birth before the parent's current update; the child's update counter starts at0. Existing bodies/weights are never rewritten.</p>
          </fieldset>
          <p className="hint">Founder energy affects initial/authored additions. Biological births transfer100 energy and16 structural units from a parent; reproduction needs260. Learning off freezes weights without erasing updates.</p>
          <button className="primary" disabled={Boolean(jsonError||draftError)||restart} onClick={applyLive}>Apply live settings</button>
          <button disabled={Boolean(jsonError||draftError)} onClick={()=>prepare(parseConfig(json))}>Prepare world · reset</button>
          <button onClick={()=>changeDraft(world.definition)}>Revert draft</button>
          <p className="hint">{jsonError||draftError|| (restart?'Initial conditions changed: Prepare world will reset.':'Changes apply at a recorded boundary before the next step.')}</p>
          <div className="test-files"><button onClick={()=>file.current?.click()}>Open JSON file</button><button disabled={Boolean(jsonError||draftError)} onClick={()=>{try{download('mathos-world.v1.json',serializeConfig(parseConfig(json)));}catch(cause){fail(cause);}}}>Save JSON file</button>
            <button disabled={Boolean(jsonError||draftError)} onClick={()=>{try{localStorage.setItem('mathos.world.v1',serializeConfig(parseConfig(json)));setMessage('Configuration saved in this browser.');}catch(cause){fail(cause);}}}>Save in browser</button>
            <button onClick={()=>{try{const text=localStorage.getItem('mathos.world.v1');if(text===null)throw Error('No saved test configuration.');changeDraft(parseConfig(text));setMessage('Saved configuration loaded as a draft.');}catch(cause){fail(cause);}}}>Load saved</button></div>
          <input className="file-input" type="file" ref={file} accept=".json,application/json" aria-label="Import test configuration file" onChange={async e=>{const f=e.target.files?.[0];e.target.value='';if(!f)return;const token=++importEpoch.current;try{if(f.size>65536)throw Error('Configuration exceeds64KiB.');const c=parseConfig(await f.text());if(token===importEpoch.current){changeDraft(c);setMessage('JSON imported as a draft; active test unchanged.');}}catch(cause){if(token===importEpoch.current)fail(cause);}}}/>
        </section>
        <div className="world-main">
        <section className="panel test-field" aria-labelledby="test-field-title"><div className="test-title-row"><h2 id="test-field-title">Shared world</h2><div className="world-view-actions"><button ref={viewToggle} aria-pressed={worldOnly} onClick={()=>setPresentation(!worldOnly)}>{worldOnly?'Show dashboard':'World only'}</button><button hidden={worldOnly} aria-expanded={showJson} aria-controls="test-json-panel" onClick={()=>setShowJson(!showJson)}>{showJson?'Hide JSON':'Show JSON'}</button></div></div>

          <div className="world-surface" data-testing={testing}>
          {testing&&<div className="test-tools" role="group" aria-label="Field tools">{(['select','food','add','erase'] as const).map(t=><button key={t} aria-pressed={tool===t} onClick={()=>setTool(t)}>{t==='food'?'Add food':t==='add'?'Add organism':t==='erase'?'Erase':'Select'}</button>)}</div>}
          <canvas ref={canvas} tabIndex={0} role="img" aria-label="Shared organism world" aria-describedby="test-field-help" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();applyTool(Math.min(world.definition.world.width-1,Math.max(0,Math.floor((e.clientX-r.left)/r.width*world.definition.world.width))),Math.min(world.definition.world.height-1,Math.max(0,Math.floor((e.clientY-r.top)/r.height*world.definition.world.height))));}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();applyTool(point.x,point.y);}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setPoint(p=>({x:Math.max(0,Math.min(world.definition.world.width-1,p.x+(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0))),y:Math.max(0,Math.min(world.definition.world.height-1,p.y+(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0)))}));}}}/>
          </div>
          <p hidden={worldOnly} id="test-field-help" className="hint">Tap a cell to use the chosen tool. Keyboard: arrows move the cursor, Enter applies. Coordinates below offer the same tools without Canvas.</p>
          <details hidden={worldOnly}><summary>Appearance & reading guide</summary><label>World appearance<select aria-label="World appearance" value={appearance} onChange={e=>setAppearance(e.target.value as typeof appearance)}><option value="terminal">Terminal organ glyphs</option><option value="classic">Classic cells</option></select></label><p className="hint">Lime core · amber pointed mouth · teal motor bars · lavender sensor cross. Body and glyphs turn together.</p></details>
          <details className="world-context" open={contextOpen} onToggle={e=>setContextOpen(e.currentTarget.open)}><summary>Inspect & tool options</summary>
          {testing&&<>
          <div className="test-coordinates">{numeric('Cell X',point.x,0,world.definition.world.width-1,x=>setPoint({...point,x}))}{numeric('Cell Y',point.y,0,world.definition.world.height-1,y=>setPoint({...point,y}))}<button onClick={()=>applyTool(point.x,point.y)}>Use tool at coordinates</button></div>
          <details><summary>Organism placement</summary><label>Body preset<select aria-label="Body preset" value={plan} onChange={e=>setPlan(e.target.value as BodyPlan)}><option>dart</option><option>grazer</option><option>scout</option></select></label><label>Placement heading<select aria-label="Placement heading" value={direction} onChange={e=>setDirection(Number(e.target.value))}>{['North','East','South','West'].map((d,i)=><option key={d} value={i}>{d}</option>)}</select></label></details>
          <div className="test-tools"><button disabled={!session.canUndo} onClick={()=>action(()=>session.undo())}>Undo last edit</button><button onClick={()=>edit({kind:'clear'})}>Clear field</button><button onClick={()=>prepare(session.initial)}>Restore prepared setup</button></div>
          </>}
          <div className="test-selection"><label>Inspect organism<select aria-label="Inspect organism" value={creature?.id??0} onChange={e=>setSelected(Number(e.target.value))}><option value="0">None selected</option>{world.creatures.map(c=><option key={c.id} value={c.id}>Organism #{c.id}</option>)}</select></label>
            {creature&&<><p>#{creature.id} · {['North','East','South','West'][creature.direction]} · energy {creature.energy} · {creature.size}/{creature.genes.layout.length} cells</p><p>{creature.action}</p><p className="hint">Updates {creature.controller.updates} · last reward {creature.lastDecision?.reward??'not yet measured'}</p>
              {testing&&<><button onClick={()=>action(()=>session.edit({tick:session.tick,kind:'rotate',id:creature.id,turn:'left'}))}>Rotate left</button><button onClick={()=>action(()=>session.edit({tick:session.tick,kind:'rotate',id:creature.id,turn:'right'}))}>Rotate right</button></>}</>}
          </div>
          </details>
        </section>

        <section hidden={worldOnly} className="panel test-results" aria-labelledby="test-results-title"><h2 id="test-results-title">Results & reports</h2>
          <div className="test-metrics">{[['Organisms',m.population],['Births',m.births],['Deaths',m.deaths],['Food intake',m.intake],['Learning updates',m.updates],['Body changes',m.acceptedChanges]].map(([label,value])=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
          <p>Automatic food supplied: {world.sunlight} / {world.definition.rules.supplyBudget??'no budget'} · available energy {m.food} / {world.definition.rules.foodCap??'no cap'}. Detailed lineage retains256 records; {world.retired.records} older records summarized. Population capacity48 is an explicit world rule.</p>
          <p><strong>Resource check: {m.exact?'exact':'FAILED'}</strong> · {m.supplied} supplied / {m.accounted} accounted</p><p className="hint">Authored additions/removals are counted separately. More survivors or updates alone do not prove better learning.</p>
          <label>My observations<textarea aria-label="My observations" maxLength={2000} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="What looked wrong, or what would you like me to investigate?"/></label>
          <div className="test-tools"><button className="primary" disabled={busy} onClick={()=>void createReport(true)}>Copy test report</button><button disabled={busy} onClick={()=>void createReport(false)}>Save test report</button></div>
          <p className="hint">Paste the whole copied report into this chat, or attach the JSON file. It includes settings, edits, actual results, errors and replay details.</p>
          {copiedReport&&<label>Report text · select and copy<textarea aria-label="Report text · select and copy" ref={fallback} readOnly value={copiedReport} onFocus={e=>e.target.select()}/></label>}
          <p className="hint">Reports replay at most1000 recent ticks from a saved boundary. Earlier history is summarized, not independently verified by that segment. Runs do not stop when a history segment fills.</p>
          <RecentInheritedChanges world={world} inspect={setSelected} />
          <label>Compare inherited organism<select aria-label="Compare inherited organism" value={world.lineage.some(l=>l.id===selected)?selected:''} onChange={e=>setSelected(Number(e.target.value))}><option value="" disabled>Select a recorded organism</option>{world.lineage.map(l=><option key={l.id} value={l.id}>#{l.id} · generation {l.generation}{l.died===null?'':' · died'}</option>)}</select></label>
          <InheritanceComparison world={world} selected={selected} />
          <svg className="test-history" viewBox="0 0 600 130" role="img" aria-label="Recent sampled population"><title>Population from0 to48; recent sampled ticks</title><path d="M25 5 V110 H590" fill="none" stroke="#5c7185"/><text x="0" y="12" fill="#b4c7dc" fontSize="12">48</text><text x="8" y="110" fill="#b4c7dc" fontSize="12">0</text><polyline fill="none" stroke="#7ed5bb" strokeWidth="2" points={world.history.map(s=>`${25+(s.tick-(world.history[0]?.tick??0))/Math.max(1,world.tick-(world.history[0]?.tick??0))*565},${110-s.population/48*100}`).join(' ')}/></svg>
          <details><summary>Detailed analytics</summary><dl>{Object.entries(m).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}</dl><table><caption>Recent population history · every20 steps</caption><thead><tr><th>Step</th><th>Population</th><th>Food sites</th></tr></thead><tbody>{world.history.map(s=><tr key={s.tick}><td>{s.tick}</td><td>{s.population}</td><td>{s.pellets}</td></tr>)}</tbody></table></details>
        </section>
        </div>
        {showJson&&<section hidden={worldOnly} className="panel test-json" id="test-json-panel"><h2>Configuration JSON</h2><p className="hint">Draft only. Valid JSON updates the controls; Apply changes the active test.</p><label>Editable configuration JSON<textarea aria-label="Editable configuration JSON" spellCheck={false} value={json} onChange={e=>{setJson(e.target.value);try{const c=parseConfig(e.target.value);setDraft(c);setJsonError('');}catch(cause){setJsonError(errorText(cause));}}}/></label><p role="status">{jsonError||draftError||'Valid configuration'}</p><button className="primary" disabled={Boolean(jsonError||draftError)||restart} onClick={applyLive}>Apply JSON settings</button><button onClick={()=>changeDraft(world.definition)}>Revert JSON draft</button><button onClick={()=>setShowJson(false)}>Hide JSON editor</button></section>}
      </div>
      <p role="status" className="feedback test-feedback">{busy?'Preparing reproducible report…':message}</p>
      <nav hidden={worldOnly} className="test-mobile-nav" aria-label="World views">{(['field','controls','results'] as const).map(v=><button key={v} aria-pressed={view===v} onClick={()=>navigate(v)}>{v==='field'?'World':v==='controls'?'Rules':'Results'}</button>)}</nav>
    </main>
  </div>;
}
export type {TestReport,World};
