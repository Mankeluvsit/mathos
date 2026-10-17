import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium, firefox } from 'playwright';
import { startServer } from './browser-server.mjs';
import { initialize, step } from '../src/ecology/genome-model.ts';

const args = process.argv.slice(2);
if(args.length>1 || (args.length===1 && args[0]!=='--public'))throw Error('Usage: node scripts/browser-mobile.mjs [--public]');
const publicReview = args[0]==='--public';
const base = publicReview ? 'https://mankeluvsit.github.io/mathos/' : 'http://127.0.0.1:4180/';
const stop = publicReview ? async()=>{} : await startServer('preview', 4180);
const captures = publicReview ? '.artifacts/mobile-public' : 'docs/previews/mobile';
mkdirSync(captures, {recursive:true});
try {
  for (const type of (publicReview ? [chromium] : [chromium, firefox])) {
    const browser = await type.launch();
    try {
      const context = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,...(type === chromium ? {isMobile:true,deviceScaleFactor:2} : {})});
      const page = await context.newPage(), errors=[], external=[];
      page.on('pageerror', e => errors.push(String(e)));
      page.on('request', r => {if(!r.url().startsWith(base))external.push(r.url());});
      page.on('dialog', d => d.accept());
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.goto(base+(publicReview ? '?lab=legacy&v=genomes4' : '?lab=legacy'));
      const nav = page.getByRole('navigation',{name:'Living world views'});
      const tick = async()=>Number(await page.getByTestId('ecology-tick').textContent());
      const canvas = page.getByRole('img',{name:/Living world/});
      const pixels = ()=>canvas.evaluate(c=>c.toDataURL());
      async function snapshot() {
        await nav.getByRole('button',{name:'Results',exact:true}).tap();
        const [download] = await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export observations',exact:true}).tap()]);
        const data=JSON.parse(readFileSync(await download.path(),'utf8'));
        await nav.getByRole('button',{name:'World',exact:true}).tap();
        return data;
      }
      assert.match(await page.getByTestId('playback-summary').textContent(),/Paused.*Start world/);
      assert.equal(await page.locator('.ecology-results').isVisible(),false);
      assert.equal(await page.getByLabel('Activity highlights',{exact:true}).isVisible(),false);
      const frame = await page.getByRole('region',{name:'Scrollable organism world'}).boundingBox();
      const dock = await page.getByRole('region',{name:'World playback'}).boundingBox();
      assert(frame.y >= 0 && frame.y+frame.height <= dock.y,'Initial phone map must fit above playback');
      // Real touch playback, not an effects toggle, starts actual state changes.
      await page.getByRole('button',{name:'Start world',exact:true}).tap();
      await page.waitForFunction(()=>Number(document.querySelector('[data-testid="ecology-tick"]').textContent)>=4);
      await page.waitForFunction(()=>Number(document.querySelector('.ecology-canvas').dataset.activity)>0);
      await page.getByRole('button',{name:'Pause world',exact:true}).tap();
      const before = await snapshot(), image = await pixels();
      await page.getByText('View controls',{exact:true}).tap();
      await page.getByRole('checkbox',{name:'Activity highlights',exact:true}).tap();
      assert.match(await page.locator('#activity-help').textContent(),/do not start playback/);
      assert.deepEqual(await snapshot(),before,'Highlight changes must preserve all observations');
      assert.equal(await pixels(),image);
      await page.getByRole('button',{name:'Start world',exact:true}).tap();
      await page.waitForFunction(t=>Number(document.querySelector('[data-testid="ecology-tick"]').textContent)>=t+4,before.tick);
      assert.equal(await canvas.getAttribute('data-activity'),'0');
      await page.getByRole('button',{name:'Pause world',exact:true}).tap();
      assert.notEqual(await pixels(),image,'Actual world must keep moving with highlights off');
      const off = await snapshot();
      let expected=initialize({format:'mathos-ecology',version:4,seed:42,mode:'seeded',learning:true,structuralMutation:true});
      while(expected.tick<off.tick)expected=step(expected);
      assert.deepEqual(off.lineage,expected.lineage);
      await page.getByRole('checkbox',{name:'Activity highlights',exact:true}).tap();
      assert.equal(await tick(),off.tick,'Turning highlights on must not secretly start the world');
      await page.getByRole('button',{name:'Start world',exact:true}).tap();
      await page.waitForFunction(()=>Number(document.querySelector('.ecology-canvas').dataset.activity)>0);
      await page.getByRole('button',{name:'Pause world',exact:true}).tap();
      const paused = await tick();
      // Inspect navigation and persistent playback work independently of World visibility.
      await page.getByRole('button',{name:'Inspect organism',exact:true}).tap();
      assert.equal(await nav.getByRole('button',{name:'Organism',exact:true}).getAttribute('aria-pressed'),'true');
      await page.getByRole('button',{name:'One step',exact:true}).tap();
      assert.equal(await tick(),paused+1);
      assert(await page.getByRole('heading',{name:'Organism #1',exact:true}).isVisible());
      // Results is isolated, cancellable and retained across navigation.
      await nav.getByRole('button',{name:'Results',exact:true}).tap();
      await page.getByRole('button',{name:'Compare learning on / off',exact:true}).tap();
      await page.getByRole('button',{name:'Cancel learning comparison',exact:true}).tap();
      await page.getByTestId('learning-comparison-status').filter({hasText:'cancelled'}).waitFor();
      const capturedTick=await tick();
      for (const [width,height] of [[390,844],[320,568],[430,932],[844,390]]) {
        await page.setViewportSize({width,height});
        for (const [view,file] of [['World','world'],['Organism','organism'],['Results','results'],['Setup','setup']]) {
          await nav.getByRole('button',{name:view,exact:true}).tap();
          assert.equal(await tick(),capturedTick);
          assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px ${view} page overflow`);
          assert.equal(await page.locator('.ecology-results').isVisible(),view==='Results');
          assert.equal(await page.locator('.ecology-inspect').isVisible(),view==='Organism');
          assert.equal(await page.locator('.ecology-setup').isVisible(),view==='Setup');
          for(const name of ['Start world','One step']) {
            const button=page.getByRole('button',{name,exact:true});
            const b=await button.boundingBox();
            assert(b.y>=0 && b.y+b.height<=height && b.height>=44,`${name} must remain reachable`);
            assert(await button.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),`${name} must not be covered`);
          }
          if(type===chromium&&width===390)await page.screenshot({path:`${captures}/phone-${file}.png`});
        }
      }
      await nav.getByRole('button',{name:'Results',exact:true}).tap();
      assert.match(await page.getByTestId('learning-comparison-status').textContent(),/cancelled/);
      await page.setViewportSize({width:1600,height:1050});
      assert(await canvas.isVisible());assert(await page.locator('.ecology-inspect').isVisible());assert(await page.locator('.ecology-setup').isVisible());assert(await page.locator('.ecology-results').isVisible());
      if(type===chromium) {
        await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${captures}/desktop.png`,fullPage:true});
        writeFileSync(`${captures}/capture-state.json`,JSON.stringify({engine:'ecology-reference@4',seed:42,learning:true,tick:capturedTick,selected:1,status:'paused',browser:'Chromium with touch',phone:{width:390,height:844},comparison:'cancelled; interactive world preserved'},null,2)+'\n');
      }
      assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
      console.log(JSON.stringify({browser:type.name(),mobile:'passed',touchPlayback:'passed',highlights:'independent from actual movement',stateAndReplay:'passed',destinations:'World/Organism/Results/Setup',sizes:'320/390/430/landscape',playbackReachability:'passed',desktop:'passed',externalRequests:0}));
    } finally {await browser.close();}
  }
} finally {await stop();}
