import { useEffect, useRef, useState } from 'react';
import { body, ecologyMetrics, parseEcology, validateEcology, W, H, END, type Ecology, type EcologyDefinition } from '../ecology/model';
import { saveEcology, loadEcology } from '../ecology/storage';
import { EcologyRuntime, type Rate } from '../runtime/ecology-runtime';

function store():Storage {try{return window.localStorage;}catch{throw Error('Browser saving is unavailable. Export still works.');}}
function exportDefinition(d:EcologyDefinition){const url=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='mathos-ecology.v1.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function EcosystemCanvas({world,selected,select}:{world:Ecology;selected:number;select:(id:number)=>void}){
 const ref=useRef<HTMLCanvasElement>(null), frame=useRef<HTMLDivElement>(null);
 const [zoom,setZoom]=useState(()=>window.innerWidth<=900?2:1),[follow,setFollow]=useState(()=>window.innerWidth<=900);
 useEffect(()=>{
  const ctx=ref.current?.getContext('2d');if(!ctx)return;
  const z=12;ctx.fillStyle='#060d16';ctx.fillRect(0,0,W*z,H*z);
  for(let p=0;p<world.food.length;p++)if(world.food[p]){ctx.fillStyle='#64d88a';ctx.beginPath();ctx.arc((p%W+.5)*z,(Math.floor(p/W)+.5)*z,2.1,0,Math.PI*2);ctx.fill();}
  for(const c of world.creatures){
   const x=c.x*z,y=c.y*z;ctx.strokeStyle=c.id===selected?'#ffffff':'#567087';ctx.lineWidth=c.id===selected?2:1;ctx.strokeRect(x-1,y-1,c.size*z+2,z+2);
   for(let i=0;i<c.size;i++){ctx.fillStyle=['#63c6ff','#f4b75f','#cf88e9'][i]!;ctx.fillRect(x+i*z+2,y+2,z-4,z-4);}
   const dx=[0,1,0,-1][c.direction]!,dy=[-1,0,1,0][c.direction]!;ctx.strokeStyle='#e2edf6';ctx.beginPath();ctx.moveTo(x+z/2,y+z/2);ctx.lineTo(x+z/2+dx*8,y+z/2+dy*8);ctx.stroke();
   if(c.id===selected){ctx.fillStyle='#ffffff';ctx.font='11px system-ui';ctx.fillText(`#${c.id}`,x,Math.max(10,y-5));}
  }
 },[world,selected]);
 useEffect(()=>{
  const c=world.creatures.find(c=>c.id===selected),box=frame.current,canvas=ref.current;
  if(follow&&zoom>1&&c&&box&&canvas)box.scrollTo({left:(c.x+c.size/2)/W*canvas.clientWidth-box.clientWidth/2,top:(c.y+.5)/H*canvas.clientHeight-box.clientHeight/2});
 },[world,selected,zoom,follow]);
 return <><div className="ecology-camera"><label>World view<select aria-label="World magnification" value={zoom} onChange={e=>setZoom(Number(e.target.value))}><option value="1">Whole world</option><option value="2">2× closer</option><option value="3">3× closer</option></select></label><label><input type="checkbox" checked={follow} onChange={e=>setFollow(e.target.checked)}/> Follow selected organism</label></div><div className="ecology-camera-frame" ref={frame} tabIndex={0} role="region" aria-label="Scrollable organism world" style={{maxHeight:zoom>1?'55vh':undefined}}><canvas ref={ref} width={W*12} height={H*12} className="ecology-canvas" style={{width:`${zoom*100}%`,maxWidth:'none'}} role="img" aria-label={`Living world, step ${world.tick}, ${world.creatures.length} organisms. Use organism selection to inspect without clicking the world.`} onClick={e=>{
  const rect=e.currentTarget.getBoundingClientRect(),x=Math.floor((e.clientX-rect.left)/rect.width*W),y=Math.floor((e.clientY-rect.top)/rect.height*H);
  const c=world.creatures.find(c=>body(c).includes(y*W+x));if(c)select(c.id);
 }} /></div></>;
}
function EcologySession({runtime,prepare,onExit}:{runtime:EcologyRuntime;prepare:(d:EcologyDefinition)=>void;onExit:()=>void}){
 const [world,setWorld]=useState(()=>runtime.snapshot()),[summary,setSummary]=useState(()=>runtime.summary());
 const [view,setView]=useState<'world'|'setup'|'inspect'>('world');
 const [selected,setSelected]=useState(1),[seed,setSeed]=useState(String(world.definition.seed)),[mode,setMode]=useState(world.definition.mode);
 const [message,setMessage]=useState('Ready. Press Start world to watch the organisms search for food.');
 const input=useRef<HTMLInputElement>(null),epoch=useRef(0),heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{
  const detach=runtime.attach();heading.current?.focus({preventScroll:true});const unsub=runtime.subscribe(()=>{setWorld(runtime.snapshot());setSummary(runtime.summary());});
  const hidden=()=>{if(document.hidden)runtime.pause();};document.addEventListener('visibilitychange',hidden);
  return()=>{epoch.current=-1;unsub();detach();document.removeEventListener('visibilitychange',hidden);};
 },[runtime]);
 const metrics=ecologyMetrics(world),creature=world.creatures.find(c=>c.id===selected),ancestor=world.lineage.find(l=>l.id===selected);
 function report(action:()=>void){try{action();}catch(e){setMessage(e instanceof Error?e.message:'Operation failed.');}}
 function draft(){return validateEcology({format:'mathos-ecology',version:1,seed:seed.trim()?Number(seed):NaN,mode});}
 function replace(d:EcologyDefinition){runtime.pause();if(world.tick>0&&!window.confirm('Restart the world and discard current progress?')){setMessage('Your world is preserved and paused.');return;}epoch.current++;prepare(d);}
 function choose(id:number){setSelected(id);setView('inspect');}
 return <>
  <header className="masthead"><div className="wordmark">MATHOS <small>OBSERVABLE ARTIFICIAL LIFE</small></div><button onClick={()=>{runtime.pause();if(window.confirm('Leave this world and discard its progress?'))onExit();}}>Open technical reference labs</button></header>
  <main className="ecology-dashboard" data-view={view}>
   <section className="intro"><div><p className="eyebrow">WATCH · SELECT · UNDERSTAND</p><h1>Follow a living pixel world.</h1></div><p className="scope">Small bodies. Food. Movement. Descendants.<br/>An experimental artificial-life model.</p></section>
   <div className="ecology-grid">
    <section className="panel ecology-world" aria-labelledby="ecology-world-title">
     <div className="ecology-heading"><div><h2 id="ecology-world-title" ref={heading} tabIndex={-1}>The foraging world</h2><p className="hint">Seed {world.definition.seed} · {world.definition.mode} · step <strong data-testid="ecology-tick">{world.tick}</strong> / {END} · <span data-testid="ecology-status">{summary.status}</span></p></div><span className="local-badge">LOCAL ONLY</span></div>
     <div className="ecology-stats"><p><strong data-testid="ecology-population">{metrics.population}</strong> organisms</p><p><strong>{metrics.pellets}</strong> food spots</p><p><strong data-testid="ecology-births">{metrics.births}</strong> births</p><p><strong>{metrics.deaths}</strong> deaths</p></div>
     <div className="actions ecology-playback"><button className="primary" disabled={!['running','paused'].includes(summary.status)} onClick={()=>summary.status==='running'?runtime.pause():runtime.start()}>{summary.status==='running'?'Pause world':'Start world'}</button><button disabled={summary.status!=='paused'} onClick={()=>runtime.singleStep()}>One step</button><button onClick={()=>replace(world.definition)}>Restart world</button><label>Speed<select aria-label="World speed" value={summary.rate} onChange={e=>runtime.setRate(Number(e.target.value) as Rate)}><option value="1">Slow · 1 step/s</option><option value="10">Normal · 10 steps/s</option><option value="30">Fast · 30 steps/s</option></select></label></div>
     <p className="ecology-guide">Outlined bodies search for green food. Select one to see its behavior, energy and family.</p>
     <EcosystemCanvas world={world} selected={selected} select={choose}/>
     <div className="ecology-legend"><span><i className="food-dot"/> Food</span><span><i className="body-cell"/> Body / controller</span><span><i className="mouth-cell"/> Mouth</span><span><i className="motor-cell"/> Motor</span></div>

     <p className="hint">White outline: selected organism. Small white mark: travel direction. Two-cell juveniles grow their motor before moving. The world pauses when you leave this browser tab.</p>
     {summary.status==='completed'&&<p role="status">This bounded experiment has finished. Restart with the same seed to replay it.</p>}{summary.error&&<p role="alert">{summary.error}</p>}
    </section>
    <section className="panel ecology-inspect" aria-labelledby="ecology-inspect-title">
     <p className="eyebrow">MEET AN ORGANISM</p><h2 id="ecology-inspect-title">{ancestor?`Organism #${selected}`:'Select an organism'}</h2>
     <label>Organism<select aria-label="Select organism" value={ancestor?selected:''} onChange={e=>setSelected(Number(e.target.value))}><option value="" disabled>Choose an organism</option>{world.lineage.map(l=><option value={l.id} key={l.id}>#{l.id} · generation {l.generation}{l.died===null?'':' · died'}</option>)}</select></label>
     {creature?<>
      <p className="ecology-action" data-testid="ecology-action">{creature.action}</p>
      <label>Stored energy: {creature.energy} / 260 needed to reproduce<progress aria-label="Organism energy toward reproduction" max="260" value={Math.min(260,creature.energy)}/></label>
      <p>Age: {creature.age} steps · generation {creature.generation}<br/>Parent: {creature.parent?`#${creature.parent}`:'founder'} · children: {world.lineage.filter(l=>l.parent===creature.id).length}<br/>Inherited trait change at birth: {ancestor?.mutated?'yes':'no'}</p>
      <div className="ecology-anatomy" aria-label={`${creature.size} functional body cells`}><span className="body-cell">Body</span><span className="mouth-cell">Mouth</span>{creature.size>=3&&<span className="motor-cell">Motor</span>}</div>
      <p className="hint">The mouth takes nearby food. The motor spends energy to move. The body stores resources and evaluates food signals.</p>
      <details open><summary>Inherited traits</summary><dl className="life-metrics"><div><dt>Food sensing</dt><dd>{creature.genes.sense} pixels</dd></div><div><dt>Food response</dt><dd>{creature.genes.foodWeight}</dd></div><div><dt>Direction persistence</dt><dd>{creature.genes.inertia}</dd></div><div><dt>Maximum age</dt><dd>{creature.genes.lifespan} steps</dd></div></dl><p className="hint">Children inherit these traits; some births change one trait. Lifetime learning is not implemented.</p></details>
      <details><summary>Why it chose a direction</summary><p>Score = food response × sensed food + direction persistence for the previous direction. Highest score wins; no food signal causes seeded exploration. Walls and bodies can block a move.</p><p>North / east / south / west scores: {creature.scores.join(' / ')}.</p><p className="hint">These are the last decision's real values. This small fixed neural controller is a baseline, not a claim of intelligence.</p></details>
     </>:<p>{ancestor?`This organism died at step ${ancestor.died}. Select a living descendant to continue observing.`:'No organisms yet. Seeded mode starts with eight authored foragers; primordial mode has food only.'}</p>}
     <button onClick={()=>{setView('world');heading.current?.scrollIntoView({block:'start'});}}>Back to the world</button>
    </section>
    <section className="panel ecology-setup" aria-labelledby="ecology-setup-title">
     <p className="eyebrow">STARTING CONDITIONS</p><h2 id="ecology-setup-title">Set up a world</h2>
     <label>World seed<input type="number" min="0" max="4294967295" value={seed} onChange={e=>setSeed(e.target.value)}/></label>
     <p className="hint">The same seed and starting settings reproduce the same world.</p>
     <label>Starting population<select aria-label="Starting population" value={mode} onChange={e=>setMode(e.target.value as EcologyDefinition['mode'])}><option value="seeded">Eight seeded foragers</option><option value="primordial">Primordial — resources only</option></select></label>
     <p className="hint">Primordial currently has no mechanism that creates organisms spontaneously.</p>
     <div className="actions"><button className="primary" onClick={()=>report(()=>replace(draft()))}>Prepare new world</button><button onClick={()=>report(()=>{saveEcology(store(),draft());setMessage('Starting settings saved in this browser.');})}>Save settings</button><button onClick={()=>report(()=>replace(loadEcology(store())))}>Load settings</button><button onClick={()=>exportDefinition(world.definition)}>Export starting settings</button><button onClick={()=>input.current?.click()}>Import settings</button></div>
     <input ref={input} type="file" className="file-input" accept=".json,application/json" aria-label="Ecology settings file" onChange={e=>{const f=e.currentTarget.files?.[0];e.currentTarget.value='';if(!f)return;const token=++epoch.current;void(async()=>{try{if(f.size>65536)throw Error('Settings file exceeds 64 KiB.');const d=parseEcology(await f.text());if(epoch.current===token)replace(d);}catch(e){if(epoch.current===token)setMessage(e instanceof Error?e.message:'Import failed.');}})();}}/>
     <p role="status" className="feedback">{message}</p>
     <details><summary>What can happen?</summary><p>Organisms seek food, spend energy, grow a motor, reproduce when mature and sufficiently fed, inherit occasional trait changes, and die from starvation or age. Limited food and space constrain survival. Food replenishment has an explicit sunlight resource budget.</p><p>Predation, complex organs, lifetime neural learning, spontaneous genesis and richer development remain planned.</p></details>
     <details><summary>Mathematical resource ledger</summary><dl className="life-metrics">{Object.entries(metrics).filter(([k])=>['foodEnergy','stores','structure','dissipated','supplied','accounted'].includes(k)).map(([k,v])=><div key={k}><dt>{k}</dt><dd data-testid={`ecology-${k}`}>{v}</dd></div>)}</dl><p>Initial resources + sunlight = food + stored energy + body structure + dissipation. Each body cell holds 8 structural units.</p></details>
    </section>
    <section className="panel ecology-events"><h2>Recent life events</h2><p className="hint">Births and deaths observed in this run. Up to 40 recent events are retained.</p><ol>{world.events.slice(0,8).map((text,i)=><li key={`${world.tick}-${i}`}>{text}</li>)}</ol></section>
   </div>
   <nav className="mobile-navigation" aria-label="Living world views"><button aria-pressed={view==='world'} onClick={()=>setView('world')}>World</button><button aria-pressed={view==='inspect'} onClick={()=>setView('inspect')}>Organism</button><button aria-pressed={view==='setup'} onClick={()=>setView('setup')}>Setup</button></nav>
  </main><footer>MATHOS · PIXEL LIFE / ECOLOGY REFERENCE 1 · EXPERIMENTAL</footer>
 </>;
}
export function EcologyLab({onExit}:{onExit:()=>void}){
 const [session,setSession]=useState(()=>({runtime:new EcologyRuntime(validateEcology({format:'mathos-ecology',version:1,seed:42,mode:'seeded'})),revision:0}));
 return <EcologySession key={session.revision} runtime={session.runtime} onExit={onExit} prepare={d=>{const next=new EcologyRuntime(d);session.runtime.dispose();setSession({runtime:next,revision:session.revision+1});}}/>;
}
