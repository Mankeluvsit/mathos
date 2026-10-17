import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {chromium,firefox} from 'playwright';
import {startServer} from './browser-server.mjs';
import {initialize,step} from '../src/ecology/genome-model.ts';
const geometry=JSON.parse(readFileSync('tests/fixtures/body-genome.v1.json','utf8'));
const golden=JSON.parse(readFileSync('tests/fixtures/ecology-v4.json','utf8'));
const args=process.argv.slice(2);
if(args.length>1||(args.length===1&&args[0]!=='--public'))throw Error('Usage: node scripts/browser-genome.mjs [--public]');
const publicReview=args[0]==='--public';
const base=publicReview?'https://mankeluvsit.github.io/mathos/':'http://127.0.0.1:4182/';
let stop;
if(!publicReview){
stop=await startServer('dev',4181);
try {
 for(const type of [chromium,firefox]){
  const browser=await type.launch();try{
   const page=await browser.newPage();await page.goto('http://127.0.0.1:4181/');
   await page.evaluate(async({geometry,golden})=>{
    const engine=await import('/src/ecology/genome-model.ts'),genome=await import('/src/ecology/body-genome.ts');
    const {drawTerminalEcology,TERMINAL_COLORS}=await import('/src/rendering/ecology-terminal.ts');
    const {drawEcology}=await import('/src/rendering/ecology-renderer.ts');
    const s=engine.initialize({format:'mathos-ecology',version:4,seed:42,mode:'seeded',learning:true,structuralMutation:true});s.food.fill(0);s.creatures=s.creatures.slice(0,1);
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=576;const ctx=canvas.getContext('2d');
    const classic={body:[99,198,255],mouth:[244,183,95],motor:[207,136,233],sensor:[124,224,208]};
    const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
    for(const f of geometry.frames){
     const c=s.creatures[0];Object.assign(c,{x:10,y:10,direction:f.direction,size:f.size});c.genes.layout=genome.validateLayout(f.layout);
     if(JSON.stringify(genome.parts(c))!==JSON.stringify(f.expected))throw Error('Independent native genome geometry mismatch');
     const before=JSON.stringify(s);
     for(const terminal of [false,true]){
      (terminal?drawTerminalEcology:drawEcology)(ctx,s,c.id);
      for(const part of f.expected){const data=ctx.getImageData(part.x*12,part.y*12,12,12).data,expected=terminal?rgb(TERMINAL_COLORS[part.role]):classic[part.role];let found=false;
       for(let i=0;i<data.length;i+=4)if(expected.every((v,k)=>v===data[i+k])){found=true;break;}
       if(!found)throw Error('Actual genome organ not drawn at physical position');
      }
     }
     if(JSON.stringify(s)!==before)throw Error('Rendering mutated the genome world');
    }
    for(const f of golden.cases){let world=engine.initialize({format:'mathos-ecology',version:4,seed:f.seed,mode:'seeded',learning:f.learning,structuralMutation:f.structuralMutation});
     for(const frame of f.frames){while(world.tick<frame.tick)world=engine.step(world);
      const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({...world,food:Array.from(world.food)})));
      const hash=Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');if(hash!==frame.sha256)throw Error('V4 native full-state regression mismatch');
     }
    }
   },{geometry,golden});
   console.log(JSON.stringify({browser:type.name(),genomeGeometry:'independent prefixes/all headings',classicAndTerminal:'physical cell positions',v4FullStateGoldens:'8 cases through1600 passed'}));
  }finally{await browser.close();}
 }
}finally{await stop();}
}
stop=publicReview?async()=>{}:await startServer('preview',4182);
const captures=publicReview?'.artifacts/genomes-public':'docs/previews/genomes';mkdirSync(captures,{recursive:true});
try{
 for(const type of (publicReview?[chromium]:[chromium,firefox])){
  const browser=await type.launch();try{
   const page=await browser.newPage({viewport:{width:1600,height:1050}}),errors=[],external=[];
   page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});page.on('dialog',d=>d.accept());
   await page.goto(base+(publicReview?'?lab=legacy&v=genomes4':'?lab=legacy'));
   assert.equal(await page.getByLabel('Simulation model',{exact:true}).inputValue(),'4');
   await page.getByText('Try a body-change example',{exact:true}).click();
   await page.getByRole('button',{name:'Load body-change example',exact:true}).click();
   assert.match(await page.locator('.ecology-heading').textContent(),/Seed 42/);
   await page.getByRole('button',{name:'Prepare new world',exact:true}).click();
   await page.getByLabel('World speed',{exact:true}).selectOption('30');
   for(let i=0;i<43;i++)await page.getByRole('button',{name:'One step',exact:true}).click();
   await page.getByRole('button',{name:'Inspect latest body change',exact:true}).click();
   assert.equal(await page.getByLabel('Select organism',{exact:true}).inputValue(),'9');
   assert.match(await page.getByTestId('genome-development').textContent(),/2 of 4/);
   for(let i=43;i<63;i++)await page.getByRole('button',{name:'One step',exact:true}).click();
   const tick=Number(await page.getByTestId('ecology-tick').textContent());
   assert.match(await page.getByTestId('genome-development').textContent(),/4 of 4/);
   const inherited=page.getByRole('region',{name:'Parent and offspring comparison'});
   assert.match(await inherited.textContent(),/mouth \(1, 0\) → mouth \(1, -1\)/);
   assert(await inherited.getByRole('img',{name:/Parent #8 inherited blueprint, 4 cells/}).isVisible());
   assert(await inherited.getByRole('img',{name:/Offspring #9 inherited blueprint, 4 cells/}).isVisible());
   assert.equal(await inherited.locator('rect[stroke="#fff"]').count(),2,'Both changed loci must have a non-color border cue');
   await page.getByLabel('Select organism',{exact:true}).selectOption('1');
   const compare=page.getByRole('button',{name:'Compare body change for organism 9',exact:true});
   await compare.focus();await page.keyboard.press('Enter');
   assert.equal(await page.getByLabel('Select organism',{exact:true}).inputValue(),'9');
   assert.equal(Number(await page.getByTestId('ecology-tick').textContent()),tick,'Comparison must not advance the world');
   await page.getByText('Body inheritance at birth',{exact:true}).click();assert.match(await page.getByTestId('genome-birth').textContent(),/mouth moved from \(1,0\) to \(1,-1\)/);
   const [d]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export observations',exact:true}).click()]);const data=JSON.parse(readFileSync(await d.path(),'utf8'));
   assert.equal(data.version,3);assert.equal(data.bodyGenome,'cell-layout@1');assert.equal(data.engine,'ecology-reference@4');
   let expected=initialize({format:'mathos-ecology',version:4,seed:4294967295,mode:'seeded',learning:true,structuralMutation:true});while(expected.tick<tick)expected=step(expected);assert.deepEqual(data.lineage,expected.lineage);
   if(type===chromium){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${captures}/desktop.png`,fullPage:true});await page.locator('.genome-inspector').screenshot({path:`${captures}/blueprint-detail.png`});}
   if(type===chromium&&!publicReview){
    mkdirSync('docs/previews/inheritance',{recursive:true});
    await inherited.screenshot({path:'docs/previews/inheritance/parent-offspring.png'});
    writeFileSync('docs/previews/inheritance/capture-state.json',JSON.stringify({engine:'ecology-reference@4',seed:4294967295,tick,selected:9,parent:8,born:40,status:'paused',browser:'Chromium',diagrams:'complete inherited north-facing targets, not current world poses',context:'Existing illustrative development seed, not held-out evaluation. Local precommit capture; dirty source recorded honestly.'},null,2)+'\n');
   }
   for(const width of [390,320]){
    await page.setViewportSize({width,height:844});const nav=page.getByRole('navigation',{name:'Living world views'});
    for(const [view,file]of [['World','phone-world'],['Organism','phone-organism'],['Results','phone-results'],['Setup','phone-setup']]){
     await nav.getByRole('button',{name:view,exact:true}).click();assert.equal(Number(await page.getByTestId('ecology-tick').textContent()),tick);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${type.name()} ${width}px ${view} page overflow`);
     if(view==='Organism')for(const svg of await inherited.getByRole('img').all()){const r=await svg.boundingBox();assert(r&&r.width>=70&&r.x>=0&&r.x+r.width<=width,'Both blueprint diagrams must fit phone width');}
     if(view==='World'){if(!await page.locator('.world-view-controls').evaluate(d=>d.open))await page.getByText('View controls',{exact:true}).click();await page.getByLabel('World magnification',{exact:true}).selectOption('3');await page.getByRole('checkbox',{name:'Follow selected organism',exact:true}).check();}
     if(type===chromium&&width===390)await page.screenshot({path:`${captures}/${file}.png`});
    }
   }
   // Platform font fallback must not push role chips or exact mutation events off the phone.
   for(const font of ['DejaVu Sans','monospace']){
    await page.evaluate(font=>document.documentElement.style.fontFamily=font,font);
    const navigation=page.getByRole('navigation',{name:'Living world views'});
    for(const view of ['World','Organism','Results','Setup']){
     await navigation.getByRole('button',{name:view,exact:true}).click();
     if(view==='Organism'){
      // A layout-only6-role fixture, removed before any capture; no organism is fabricated.
      const fits=await page.evaluate(()=>{const list=document.createElement('div');list.className='ecology-anatomy';
       for(const role of ['body','mouth','motor','sensor','sensor','sensor']){const cell=document.createElement('span');cell.className=role+'-cell';cell.textContent=role;list.append(cell);}
       document.querySelector('.ecology-inspect').append(list);const bounds=list.getBoundingClientRect();
       const inside=[...list.children].every(cell=>{const r=cell.getBoundingClientRect();return r.width>0&&r.left>=bounds.left&&r.right<=bounds.right+1;});list.remove();return inside;
      });assert(fits,`${font}: all6 role labels must fit`);
     }
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${font}: ${view} page overflow`);
    }
   }
   await page.evaluate(()=>document.documentElement.style.fontFamily='');
   // New settings are drafts; saving, import/export and v4 slots retain both booleans.
   const nav=page.getByRole('navigation',{name:'Living world views'});await nav.getByRole('button',{name:'Setup',exact:true}).click();
   await page.getByRole('checkbox',{name:'Allow structural mutations',exact:true}).uncheck();await page.getByRole('button',{name:'Save settings',exact:true}).click();
   assert.equal(Number(await page.getByTestId('ecology-tick').textContent()),tick);
   await page.getByRole('button',{name:'Prepare new world',exact:true}).click();await nav.getByRole('button',{name:'Setup',exact:true}).click();
   const [settings]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export starting settings',exact:true}).click()]);const definition=JSON.parse(readFileSync(await settings.path(),'utf8'));assert.equal(definition.version,4);assert.equal(definition.structuralMutation,false);
   await page.getByLabel('Ecology settings file',{exact:true}).setInputFiles({name:'genomes.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...definition,structuralMutation:true}))});
   await nav.getByRole('button',{name:'Setup',exact:true}).click();assert(await page.getByRole('checkbox',{name:'Allow structural mutations',exact:true}).isChecked());
   await page.getByRole('button',{name:'Load settings',exact:true}).click();await nav.getByRole('button',{name:'Setup',exact:true}).click();assert.equal(await page.getByRole('checkbox',{name:'Allow structural mutations',exact:true}).isChecked(),false);
   await nav.getByRole('button',{name:'Results',exact:true}).click();await page.getByRole('button',{name:'Compare learning on / off',exact:true}).click();
   if(type===chromium&&!publicReview)await page.getByTestId('learning-comparison-status').filter({hasText:'12 of 12 runs complete'}).waitFor({timeout:180000});
   else {await page.getByRole('button',{name:'Cancel learning comparison',exact:true}).click();await page.getByTestId('learning-comparison-status').filter({hasText:'cancelled'}).waitFor();}
   const [result]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export learning comparison',exact:true}).click()]);const comparison=JSON.parse(readFileSync(await result.path(),'utf8'));assert.equal(comparison.version,2);assert.equal(comparison.engine,'ecology-reference@4');for(const run of comparison.runs){assert.equal(run.definition.structuralMutation,false);assert.equal(run.metrics.accounted,run.metrics.supplied);}
   if(publicReview){const manifest=await page.evaluate(async()=>{const response=await fetch(new URL('preview.json?v=genomes4',location.href));return response.json();});assert.equal(comparison.source.revision,manifest.sourceCommit);assert.equal(comparison.source.dirty,false);}
   if(type===chromium&&!publicReview)for(const fixture of golden.cases.filter(f=>!f.structuralMutation)){const run=comparison.runs.find(r=>r.definition.seed===fixture.seed&&r.definition.learning===fixture.learning);assert.deepEqual(run.metrics,fixture.frames.at(-1).metrics);}
   if(type===chromium)writeFileSync(`${captures}/capture-state.json`,JSON.stringify({engine:'ecology-reference@4',bodyGenome:'cell-layout@1',seed:4294967295,tick,selected:9,status:'paused',illustration:'Predeclared development seed chosen to show an early relocated-mouth birth at40 and actual resource-funded fourth-cell development by63; not representative performance evidence.'},null,2)+'\n');
   if(type===chromium&&!publicReview){const p='docs/previews/inheritance/capture-state.json';writeFileSync(p,JSON.stringify({...JSON.parse(readFileSync(p,'utf8')),source:comparison.source},null,2)+'\n');}
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log(JSON.stringify({browser:type.name(),genomeUI:'actual inherited change and growth passed',v4Persistence:'passed',comparison:type===chromium&&!publicReview?'12 v4 runs complete':'v4 cancellation',responsive:'320/390',externalRequests:0}));
  }finally{await browser.close();}
 }
}finally{await stop();}
