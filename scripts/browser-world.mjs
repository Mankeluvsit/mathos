import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {chromium,firefox} from 'playwright';
import {startServer} from './browser-server.mjs';
import {presetConfig,validateConfig} from '../src/world/config.ts';
import {parseReport,verifyReport} from '../src/world/report.ts';
const live=process.argv.includes('--public'),base=live?'https://mankeluvsit.github.io/mathos/':'http://127.0.0.1:4185/';
const stop=live?async()=>{}:await startServer('preview',4185),folder=live?'.artifacts/world-public':'docs/previews/world';mkdirSync(folder,{recursive:true});
const designFolder=live?'.artifacts/design-public':'docs/previews/design';mkdirSync(designFolder,{recursive:true});
const digest=async text=>createHash('sha256').update(text).digest('hex');
try{for(const type of live?[chromium]:[chromium,firefox]){
 const browser=await type.launch();try{
  const context=await browser.newContext({viewport:{width:1600,height:1050},hasTouch:true});
  if(type===chromium)await context.grantPermissions(['clipboard-read','clipboard-write']);else await context.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__worldCopy=text;}}}));
  const page=await context.newPage(),errors=[],external=[];page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))external.push(r.url());});page.on('dialog',d=>d.accept());
  await page.goto(base+'?v=shared1');const progress=page.getByTestId('test-field-progress');
  assert.equal(await page.locator('canvas').count(),1);assert.equal(await page.getByRole('button',{name:'Open test field',exact:true}).count(),0);assert.equal(await page.getByLabel('Editable configuration JSON',{exact:true}).count(),0);
  const downloadReport=async()=>{await page.getByRole('button',{name:'Save test report',exact:true}).evaluate(el=>el.scrollIntoView({block:'center'}));const d=page.waitForEvent('download');await page.getByRole('button',{name:'Save test report',exact:true}).click();const report=JSON.parse(readFileSync(await(await d).path(),'utf8'));await verifyReport(report,digest);return report;};
  await page.getByRole('button',{name:'One world step',exact:true}).click();const initial=await downloadReport();
  if(type===chromium){await page.screenshot({path:`${folder}/default-world.png`,fullPage:true});writeFileSync(`${folder}/default-capture-state.json`,JSON.stringify({source:initial.source,engine:initial.engine,tick:initial.tick,initial:initial.initial,finalHash:initial.finalHash,context:'Default neutral profile, step1, no author interventions. Functional capture, not a fairness evaluation.'},null,2)+'\n');}
  const sameCanvas=await page.locator('canvas').elementHandle();
  await page.getByRole('button',{name:'World only',exact:true}).click();
  assert(await page.getByRole('button',{name:'Show dashboard',exact:true}).isVisible());
  assert.equal(await page.getByRole('heading',{name:'World rules',exact:true}).isVisible(),false);
  assert(await page.locator('canvas').evaluate((el,previous)=>el===previous,sameCanvas));
  assert(await page.locator('canvas').evaluate(el=>document.activeElement===el));
  if(type===chromium){await page.screenshot({path:`${designFolder}/world-only-desktop.png`,fullPage:true});writeFileSync(`${designFolder}/capture-state.json`,JSON.stringify({source:initial.source,engine:initial.engine,presentation:'mathos-presentation@1',tick:initial.tick,finalHash:initial.finalHash,context:'Actual default neutral world, paused at step1. World-only changes presentation, not scientific state.'},null,2)+'\n');}
  await page.keyboard.press('Escape');assert(await page.getByRole('button',{name:'World only',exact:true}).evaluate(el=>document.activeElement===el));
  assert.equal((await downloadReport()).finalHash,initial.finalHash,'World-only must preserve scientific state');
  await page.getByRole('checkbox',{name:'Testing tools · same world',exact:true}).check();await page.getByRole('checkbox',{name:'Testing tools · same world',exact:true}).uncheck();assert.equal((await downloadReport()).finalHash,initial.finalHash,'Test tools must not make another world or alter this one');
  await page.getByRole('button',{name:'Show JSON',exact:true}).click();const editor=page.getByLabel('Editable configuration JSON',{exact:true});
  const capped=structuredClone(presetConfig('empty'));capped.rules.foodCap=25;capped.rules.supplyBudget=25;capped.test.steps=6;
  await editor.fill(JSON.stringify(capped));await page.getByRole('button',{name:'Prepare world · reset',exact:true}).click();
  await page.getByRole('button',{name:'Hide JSON',exact:true}).click();
  await page.getByLabel('Playback speed',{exact:true}).selectOption('30');await page.getByRole('button',{name:'World only',exact:true}).click();await page.getByRole('button',{name:'Start world',exact:true}).click();await progress.filter({hasText:'6 / 6'}).waitFor();await page.getByRole('button',{name:'Show dashboard',exact:true}).click();
  const capReport=await downloadReport();assert.equal(capReport.status,'completed');assert.equal(capReport.metrics.food,25);assert.equal(capReport.metrics.sunlight,25);
  await page.getByRole('checkbox',{name:'Stop at chosen step',exact:true}).uncheck();await page.getByRole('button',{name:'Apply live settings',exact:true}).click();await page.getByRole('button',{name:'Start world',exact:true}).click();await page.waitForFunction(()=>Number(document.querySelector('[data-testid="test-field-progress"]').textContent.split(' / ')[0])>=10);await page.getByRole('button',{name:'Pause world',exact:true}).click();
  const continued=await downloadReport();assert(continued.tick>6);assert.equal(continued.status,'paused');assert.equal(continued.requestedSteps,null);
  await page.getByRole('checkbox',{name:'Cap available food energy',exact:true}).uncheck();await page.getByRole('checkbox',{name:'Limit total replenishment',exact:true}).uncheck();await page.getByRole('checkbox',{name:'Replenish food',exact:true}).uncheck();await page.getByRole('checkbox',{name:'Offspring inherit controller weights · experimental',exact:true}).check();await page.getByRole('checkbox',{name:'Offspring inherit body layout',exact:true}).uncheck();await page.getByRole('checkbox',{name:'Offspring inherit scalar traits',exact:true}).uncheck();await page.getByRole('button',{name:'Apply live settings',exact:true}).click();
  await page.getByRole('checkbox',{name:'Testing tools · same world',exact:true}).check();await page.getByRole('button',{name:'Clear field',exact:true}).click();await page.getByRole('button',{name:'Add organism',exact:true}).click();await page.getByLabel('Cell X',{exact:true}).fill('8');await page.getByLabel('Cell Y',{exact:true}).fill('8');await page.getByRole('button',{name:'Use tool at coordinates',exact:true}).click();await page.getByRole('button',{name:'Rotate right',exact:true}).click();
  await page.getByRole('button',{name:'Add food',exact:true}).click();await page.getByLabel('Cell X',{exact:true}).fill('10');await page.getByRole('button',{name:'Use tool at coordinates',exact:true}).click();await page.getByRole('button',{name:'Undo last edit',exact:true}).click();await page.getByRole('button',{name:'Use tool at coordinates',exact:true}).click();
  await page.getByRole('button',{name:'One world step',exact:true}).click();const edited=await downloadReport();assert(edited.edited);assert.equal(edited.metrics.introduced,1);assert.equal(edited.undoCount,1);assert.equal(edited.checkpoint.definition.format,'mathos-world');assert.equal(edited.metrics.exact,true);
  await page.getByRole('button',{name:'Show JSON',exact:true}).click();const valid=await editor.inputValue();await editor.fill('{invalid');assert(await page.getByRole('button',{name:'Apply live settings',exact:true}).isDisabled());await page.getByRole('button',{name:'Hide JSON',exact:true}).click();await page.getByRole('button',{name:'Show JSON',exact:true}).click();assert.equal(await editor.inputValue(),'{invalid');await editor.fill(valid);validateConfig(JSON.parse(valid));await page.getByRole('button',{name:'Hide JSON',exact:true}).click();
  await page.getByRole('button',{name:'Copy test report',exact:true}).click();await page.getByLabel('Report text · select and copy',{exact:true}).waitFor();const text=type===chromium?await page.evaluate(()=>navigator.clipboard.readText()):await page.evaluate(()=>window.__worldCopy);await verifyReport(parseReport(text),digest);
  if(live){const manifest=await page.evaluate(async()=>{const r=await fetch('preview.json?v=shared1');return r.json();});assert.equal(edited.source.revision,manifest.sourceCommit);assert.equal(edited.source.dirty,false);}
  if(type===chromium){await page.screenshot({path:`${folder}/desktop.png`,fullPage:true});writeFileSync(`${folder}/capture-state.json`,JSON.stringify({source:edited.source,engine:edited.engine,tick:edited.tick,initial:edited.initial,report:edited.finalHash,context:'Actual bounded cap test continued without endpoint; one authored organism and recorded field edits. Not a neutral evaluation outcome.'},null,2)+'\n');}
  const nav=page.getByRole('navigation',{name:'World views'});
  for(const [width,height]of [[390,844],[320,568],[430,932],[844,390]]){
   await page.setViewportSize({width,height});await nav.getByRole('button',{name:'World',exact:true}).click();
   const canvas=page.getByRole('img',{name:'Shared organism world'}),c=await canvas.boundingBox(),dock=await page.getByRole('region',{name:'World playback'}).boundingBox();assert(c&&dock&&c.y+c.height<=dock.y,`Map must fit above dock ${width}x${height}: ${JSON.stringify({c,dock})}`);
   for(const name of ['World','Rules','Results']){await nav.getByRole('button',{name,exact:true}).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}px ${name} overflow`);assert.match(await progress.textContent(),/until paused/);if(type===chromium&&width===390)await page.screenshot({path:`${folder}/phone-${name.toLowerCase()}.png`});}
   if(width===390){
    await nav.getByRole('button',{name:'Rules',exact:true}).tap();
    const foodSwitch=page.getByRole('checkbox',{name:'Replenish food',exact:true});await foodSwitch.evaluate(el=>el.scrollIntoView({block:'center'}));await foodSwitch.check();
    const apply=page.getByRole('button',{name:'Apply live settings',exact:true});await apply.evaluate(el=>el.scrollIntoView({block:'center'}));await apply.tap();
    await nav.getByRole('button',{name:'Results',exact:true}).tap();const phoneReport=await downloadReport();assert.equal(phoneReport.edits.at(-1).config.rules.replenishment,true,'Phone rule control must change the same scientific world');
   }
   await nav.getByRole('button',{name:'World',exact:true}).tap();
   await page.getByRole('button',{name:'World only',exact:true}).tap();
   assert.equal(await nav.isVisible(),false);
   const focusCanvas=await canvas.boundingBox(),focusDock=await page.getByRole('region',{name:'World playback'}).boundingBox();
   assert(focusCanvas&&focusDock&&focusCanvas.y+focusCanvas.height<=focusDock.y,`World-only map above playback ${width}px`);
   const contextSummary=await page.locator('.world-context>summary').boundingBox();assert(contextSummary&&focusDock&&contextSummary.y+contextSummary.height<=focusDock.y,'Context tools reachable above playback');
   const restore=page.getByRole('button',{name:'Show dashboard',exact:true}),restoreBox=await restore.boundingBox();
   assert(restoreBox&&restoreBox.height>=44&&restoreBox.y>=0&&restoreBox.y+restoreBox.height<=height);
   if(type===chromium&&width===390)await page.screenshot({path:`${designFolder}/world-only-phone.png`});
   await page.getByRole('button',{name:'One world step',exact:true}).tap();
   await restore.tap();assert(await nav.isVisible());
   for(const name of ['Start world','One world step']){const r=await page.getByRole('button',{name,exact:true}).boundingBox();assert(r&&r.height>=44&&r.y>=0&&r.y+r.height<=height,`Playback reachable ${width}px`);}
  }
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log(JSON.stringify({browser:type.name(),oneWorld:'passed',worldOnly:'same canvas/state, playback, keyboard and touch restore passed',caps:'25 exact',endpoint:'continued',inheritanceControls:'passed',JSON:'hide/invalid/sync',editsAndReports:'Node replay matched',phone:'320/390/430/landscape',externalRequests:external.length,live}));
 }finally{await browser.close();}
}}finally{await stop();}
