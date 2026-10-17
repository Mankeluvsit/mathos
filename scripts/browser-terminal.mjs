import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { chromium, firefox } from 'playwright';
import { startServer } from './browser-server.mjs';
import { initialize, step } from '../src/ecology/learning-model.ts';

const stop = await startServer('preview', 4179);
const captures = 'docs/previews/terminal';
mkdirSync(captures, {recursive:true});
async function observation(page) {
  const [download] = await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export observations',exact:true}).click()]);
  return JSON.parse(readFileSync(await download.path(),'utf8'));
}
try {
  for (const type of [chromium,firefox]) {
    const browser=await type.launch();
    try {
      const page=await browser.newPage({viewport:{width:1600,height:1050}}),errors=[],external=[];
      await page.emulateMedia({reducedMotion:'no-preference'});
      page.on('pageerror',e=>errors.push(String(e)));
      page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4179/'))external.push(r.url());});
      page.on('dialog',d=>d.accept());
      await page.goto('http://127.0.0.1:4179/');
      await page.getByText('View controls',{exact:true}).click();
      const canvas=page.getByRole('img',{name:/Living world/});
      const pixels=()=>canvas.evaluate(c=>c.toDataURL());
      assert.equal(await page.getByLabel('World appearance',{exact:true}).inputValue(),'terminal');
      for(let i=0;i<20;i++) await page.getByRole('button',{name:'One step',exact:true}).click();
      const before=await observation(page),terminalImage=await pixels();
      if(type===chromium) await canvas.screenshot({path:`${captures}/terminal-world.png`});
      await page.getByLabel('World appearance',{exact:true}).selectOption('classic');
      assert.notEqual(await pixels(),terminalImage);
      assert(await page.getByRole('checkbox',{name:'Activity highlights'}).isDisabled());
      if(type===chromium) await canvas.screenshot({path:`${captures}/classic-world.png`});
      await page.getByLabel('World appearance',{exact:true}).selectOption('terminal');
      assert.equal(await pixels(),terminalImage);
      assert.deepEqual(await observation(page),before);
      await page.getByRole('checkbox',{name:'Activity highlights'}).uncheck();
      await page.getByRole('button',{name:'Start world',exact:true}).click();
      await page.waitForFunction(()=>Number(document.querySelector('[data-testid="ecology-tick"]').textContent)>=23);
      assert.equal(await canvas.getAttribute('data-activity'),'0');
      await page.getByRole('checkbox',{name:'Activity highlights'}).check();
      await page.waitForFunction(()=>Number(document.querySelector('.ecology-canvas').dataset.activity)>0);
      await page.getByRole('button',{name:'Pause world',exact:true}).click();
      const paused=await pixels();await page.waitForTimeout(240);
      assert.equal(await pixels(),paused);assert.equal(await canvas.getAttribute('data-activity'),'0');
      // Live preference changes cancel effects while preserving an advancing world.
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.getByText('Reduced motion: activity animations are off.',{exact:false}).waitFor();
      assert(await page.getByRole('checkbox',{name:'Activity highlights'}).isDisabled());
      await page.getByRole('button',{name:'Start world',exact:true}).click();await page.waitForTimeout(240);
      assert.equal(await canvas.getAttribute('data-activity'),'0');
      await page.getByRole('button',{name:'Pause world',exact:true}).click();
      const current=await observation(page);
      let expected=initialize({format:'mathos-ecology',version:3,seed:42,mode:'seeded',learning:true});
      while(expected.tick<current.tick) expected=step(expected);
      assert.deepEqual(current.lineage,expected.lineage);
      await page.emulateMedia({reducedMotion:'no-preference'});
      // Stable tick20 review captures, identical starting conditions to the comparison above.
      await page.getByText('Restart current world',{exact:true}).click();
      await page.getByRole('button',{name:'Restart world',exact:true}).click();
      await page.getByText('View controls',{exact:true}).click();
      for(let i=0;i<20;i++) await page.getByRole('button',{name:'One step',exact:true}).click();
      if(type===chromium) {
        await page.evaluate(()=>scrollTo(0,0));
        await page.screenshot({path:`${captures}/desktop.png`,fullPage:true});
      }
      for(const width of [390,320]) {
        await page.setViewportSize({width,height:844});
        const nav=page.getByRole('navigation',{name:'Living world views'});
        for(const [view,file] of [['World','phone-world'],['Organism','phone-organism'],['Setup','phone-setup']]) {
          await nav.getByRole('button',{name:view,exact:true}).click();
          assert.equal(await page.getByTestId('ecology-tick').textContent(),'20');
          assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
          if(type===chromium&&width===390) {
            if(view==='World') { await page.getByLabel('World magnification',{exact:true}).selectOption('3');await page.getByRole('checkbox',{name:'Follow selected organism'}).check();await page.getByRole('region',{name:'Scrollable organism world'}).scrollIntoViewIfNeeded(); }
            else await page.evaluate(()=>scrollTo(0,0));
            await page.screenshot({path:`${captures}/${file}.png`,fullPage:false});
          }
        }
      }
      assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
      console.log(JSON.stringify({browser:type.name(),terminal:'passed',styleChanges:'same observations',pause:'stable pixels',reducedMotion:'passed',mobile:'320/390',externalRequests:0}));
    } finally { await browser.close(); }
  }
  if(process.argv.includes('--capture-video')) {
    mkdirSync('.artifacts/terminal-video',{recursive:true});
    const browser=await chromium.launch();
    try {
      const context=await browser.newContext({viewport:{width:1100,height:780},recordVideo:{dir:'.artifacts/terminal-video',size:{width:1100,height:780}}});
      const page=await context.newPage();
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.goto('http://127.0.0.1:4179/');
      await page.getByText('View controls',{exact:true}).click();
      await page.getByLabel('World magnification',{exact:true}).selectOption('3');
      await page.getByRole('checkbox',{name:'Follow selected organism'}).check();
      await page.getByRole('button',{name:'Start world',exact:true}).click();
      const frame=page.getByRole('region',{name:'Scrollable organism world'});await frame.scrollIntoViewIfNeeded();
      const box=await frame.boundingBox();
      await page.waitForTimeout(6500);
      const tick=Number(await page.getByTestId('ecology-tick').textContent());
      const video=page.video();await context.close();const videoPath=await video.path();
      const crop=`crop=${Math.floor(box.width/2)*2}:${Math.floor(box.height/2)*2}:${Math.max(0,Math.floor(box.x))}:${Math.max(0,Math.floor(box.y))},fps=12,split[a][b];[a]palettegen[p];[b][p]paletteuse`;
      const result=spawnSync('ffmpeg',['-y','-loglevel','error','-sseof','-4','-i',videoPath,'-filter_complex',crop,`${captures}/activity.gif`],{encoding:'utf8'});
      if(result.error||result.status!==0) throw Error(`Optional animation export failed: ${result.error?.message??result.stderr}`);
      writeFileSync(`${captures}/capture-state.json`,JSON.stringify({engine:'ecology-reference@3',seed:42,learning:true,stillTick:20,videoEndingTick:tick,videoDescription:'Last four seconds of real Chromium playback, 10 ticks/s, 3x view following organism1. Native viewport recording cropped to the visible world; no simulated or painted frames.'},null,2)+'\n');
      console.log(`Actual playback animation exported; ending tick ${tick}.`);
    } finally {await browser.close();}
  }
} finally {await stop();}
