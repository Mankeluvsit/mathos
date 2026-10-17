import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium,firefox} from 'playwright';
import {startServer} from './browser-server.mjs';
import {parseReport,verifyReport} from '../src/testfield/report.ts';
const publicReview=process.argv.includes('--public');
const captures=publicReview?'.artifacts/testfield-public':'docs/previews/testfield';mkdirSync(captures,{recursive:true});
const stop=publicReview?null:await startServer('preview',4183);
try{
 for(const type of (publicReview?[chromium]:[chromium,firefox])){
  const browser=await type.launch();
  try{
   const context=await browser.newContext({viewport:{width:1600,height:1050}});
   if(type===chromium)await context.grantPermissions(['clipboard-read','clipboard-write']);
   else await context.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__testCopy=text;}}});});
   const page=await context.newPage(),external=[];page.on('request',r=>{if(!r.url().startsWith(publicReview?'https://mankeluvsit.github.io/':'http://127.0.0.1:4183/')&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))external.push(r.url());});
   await page.goto(publicReview?'https://mankeluvsit.github.io/mathos/?v=testfield1':'http://127.0.0.1:4183/');
   await page.getByRole('button',{name:'One step',exact:true}).click();
   const livingTick=await page.getByTestId('ecology-tick').textContent();
   await page.getByRole('button',{name:'Open test field',exact:true}).click();const lab=page.locator('.test-lab');
   assert(await lab.isVisible());assert.equal(await lab.getByLabel('Editable configuration JSON',{exact:true}).count(),0);
   await lab.getByRole('button',{name:'Show JSON',exact:true}).click();const editor=lab.getByLabel('Editable configuration JSON',{exact:true});
   const config=JSON.parse(await editor.inputValue());config.test.steps=16;await editor.fill(JSON.stringify(config));
   assert.equal(await lab.getByLabel('Test step limit',{exact:true}).inputValue(),'16');
   const before=await lab.getByTestId('test-field-progress').textContent();await editor.fill('{broken');
   await lab.getByRole('button',{name:'Hide JSON',exact:true}).click();await lab.getByRole('button',{name:'Show JSON',exact:true}).click();
   assert.equal(await editor.inputValue(),'{broken');assert.equal(await lab.getByTestId('test-field-progress').textContent(),before);
   await editor.fill(JSON.stringify(config));await lab.getByRole('button',{name:'Apply live settings',exact:true}).click();
   await lab.getByLabel('Playback speed',{exact:true}).selectOption('30');await lab.getByRole('button',{name:'Run prepared test',exact:true}).click();
   await lab.getByTestId('test-field-progress').filter({hasText:'16 / 16'}).waitFor();
   const downloaded=page.waitForEvent('download');await lab.getByRole('button',{name:'Save test report',exact:true}).click();
   const report=JSON.parse(readFileSync(await (await downloaded).path(),'utf8'));
   const verified=await verifyReport(report,async text=>createHash('sha256').update(text).digest('hex'));
   assert.equal(verified.world.tick,16);assert(verified.metrics.exact);assert(verified.metrics.updates>0);assert(verified.metrics.moves>0);
   if(publicReview){const manifest=await page.evaluate(async()=>{const response=await fetch(new URL('preview.json?v=testfield1',location.href));if(!response.ok)throw Error('Preview manifest unavailable.');return response.json();});assert.equal(report.source.revision,manifest.sourceCommit);assert.equal(report.source.dirty,false);}
   const updates=report.metrics.updates;
   await lab.getByRole('checkbox',{name:'Learning',exact:true}).uncheck();await lab.getByLabel('Test step limit',{exact:true}).fill('32');
   await lab.getByRole('button',{name:'Apply live settings',exact:true}).click();await lab.getByRole('button',{name:'Run prepared test',exact:true}).click();
   await lab.getByTestId('test-field-progress').filter({hasText:'32 / 32'}).waitFor();
   await lab.getByRole('button',{name:'Copy test report',exact:true}).click();await lab.getByLabel('Report text · select and copy',{exact:true}).waitFor();
   const copied=type===chromium?await page.evaluate(()=>navigator.clipboard.readText()):await page.evaluate(()=>window.__testCopy);
   const second=parseReport(copied);assert.equal(second.metrics.updates,updates);await verifyReport(second,async text=>createHash('sha256').update(text).digest('hex'));
   // A genuinely controllable empty field: placement, rotation, food, undo and replay.
   await lab.getByLabel('Prepared scenario',{exact:true}).selectOption('empty');await lab.getByLabel('Test step limit',{exact:true}).fill('16');
   await lab.getByRole('button',{name:'Prepare test · reset field',exact:true}).click();
   await lab.getByRole('button',{name:'Add organism',exact:true}).click();await lab.getByLabel('Cell X',{exact:true}).fill('8');await lab.getByLabel('Cell Y',{exact:true}).fill('8');
   await lab.getByRole('button',{name:'Use tool at coordinates',exact:true}).click();await lab.getByRole('button',{name:'Rotate right',exact:true}).click();
   await lab.getByRole('button',{name:'Add food',exact:true}).click();await lab.getByLabel('Cell X',{exact:true}).fill('10');
   await lab.getByRole('button',{name:'Use tool at coordinates',exact:true}).click();await lab.getByRole('button',{name:'Undo last edit',exact:true}).click();
   await lab.getByRole('button',{name:'Use tool at coordinates',exact:true}).click();
   await lab.getByRole('button',{name:'One test step',exact:true}).click();
   const editedDownload=page.waitForEvent('download');await lab.getByRole('button',{name:'Save test report',exact:true}).click();
   const edited=JSON.parse(readFileSync(await (await editedDownload).path(),'utf8'));await verifyReport(edited,async text=>createHash('sha256').update(text).digest('hex'));assert(edited.edited);assert.equal(edited.undoCount,1);
   await lab.getByRole('button',{name:'Save JSON file',exact:true}).click();
   await lab.getByLabel('Import test configuration file',{exact:true}).setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad')});
   assert.equal(await lab.getByTestId('test-field-progress').textContent(),'1 / 16 steps');
   // Clipboard denied must provide actual selectable text, not report a false success.
   await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('Test denial');}}}));
   await lab.getByRole('button',{name:'Copy test report',exact:true}).click();await lab.getByText('Clipboard unavailable. Select and copy the report text below.',{exact:true}).waitFor();
   const fallback=parseReport(await lab.getByLabel('Report text · select and copy',{exact:true}).inputValue());await verifyReport(fallback,async text=>createHash('sha256').update(text).digest('hex'));
   if(type===chromium){await page.setViewportSize({width:1600,height:1050});await page.screenshot({path:`${captures}/desktop.png`,fullPage:true});}
   for(const [width,height] of [[390,844],[320,568]]){
    await page.setViewportSize({width,height});
    for(const view of ['Field','Controls','Results']){
     await lab.getByRole('navigation',{name:'Test field views'}).getByRole('button',{name:view,exact:true}).click();
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${type.name()} ${width}px ${view} overflow`);
     const run=lab.getByRole('button',{name:'Run prepared test',exact:true});assert(await run.isVisible());
     assert(await run.evaluate(b=>{const r=b.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.height>=44&&r.top>=0&&r.bottom<=innerHeight&&(hit===b||b.contains(hit));}),'Reachable44px playback');
     if(view==='Field'){const map=await lab.locator('canvas').boundingBox(),dock=await lab.locator('.test-playback').boundingBox();assert(map.y+map.height<=dock.y,`${width}px field must fit above playback: ${JSON.stringify({map,dock})}`);}
     if(type===chromium&&width===390)await page.screenshot({path:`${captures}/phone-${view.toLowerCase()}.png`,fullPage:true});
    }
   }
   await page.getByRole('button',{name:'Living world',exact:true}).click();assert.equal(await page.getByTestId('ecology-tick').textContent(),livingTick);
   await page.getByRole('button',{name:'Open test field',exact:true}).click();assert.equal(await lab.getByTestId('test-field-progress').textContent(),'1 / 16 steps');
   assert.equal(external.length,0,JSON.stringify(external));
   writeFileSync(`${captures}/capture-state.json`,JSON.stringify({engine:edited.engine,initial:edited.initial,tick:edited.tick,edits:edited.edits,source:edited.source,note:'Actual browser workflows; images are not the proposal.'},null,2)+'\n');
   console.log(JSON.stringify({browser:type.name(),testField:'passed',JSON:'show/hide/invalid/sync',preparedTest:'completed',liveLearning:'freeze preserved',edits:'Node replay matched',clipboard:type===chromium?'native plus denial fallback':'simulated adapter plus denial fallback',phone:'320/390 reachable playback',worldPreservation:'passed',externalRequests:external.length}));
  }finally{await browser.close();}
 }
}finally{if(stop)await stop();}
