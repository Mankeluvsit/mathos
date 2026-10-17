import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { chromium, firefox } from 'playwright';
import { startServer } from './browser-server.mjs';
import { initialize, step } from '../src/ecology/learning-model.ts';
const golden = JSON.parse(readFileSync(new URL('../tests/fixtures/ecology-v3.json', import.meta.url), 'utf8'));
const stop = await startServer('preview', 4178);
const captures = 'docs/previews/learning';
mkdirSync(captures, {recursive: true});
try {
  for (const type of [chromium, firefox]) {
    const browser = await type.launch();
    try {
      const page = await browser.newPage({viewport:{width:1600,height:1050}}), errors=[], external=[];
      page.on('pageerror', e => errors.push(String(e)));
      page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1:4178/')) external.push(r.url()); });
      page.on('dialog', d => d.accept());
      await page.goto('http://127.0.0.1:4178/');
      await page.getByLabel('Simulation model',{exact:true}).selectOption('3');
      await page.getByRole('button',{name:'Prepare new world',exact:true}).click();
      assert.match(await page.getByTestId('learning-mode').textContent(), /Learning on/);
      await page.getByRole('button',{name:'One step',exact:true}).click();
      assert.equal(await page.getByTestId('learning-updates').textContent(),'1');
      const [download] = await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export observations',exact:true}).click()]);
      const data=JSON.parse(readFileSync(await download.path(),'utf8'));
      const expected=step(initialize({format:'mathos-ecology',version:3,seed:42,mode:'seeded',learning:true}));
      assert.equal(data.version,2); assert.equal(data.engine,'ecology-reference@3');
      assert.deepEqual(data.lineage,expected.lineage);
      assert.match(await page.getByTestId('learning-reward').textContent(),new RegExp(`Reward: ${expected.creatures[0].lastDecision.reward}`));
      // Cancel retains a real partial result and never advances the visible world.
      await page.getByRole('button',{name:'Compare learning on / off',exact:true}).click();
      await page.getByRole('button',{name:'Cancel learning comparison',exact:true}).click();
      await page.getByTestId('learning-comparison-status').filter({hasText:'cancelled'}).waitFor();
      assert.equal(await page.getByTestId('ecology-tick').textContent(),'1');
      await page.getByRole('button',{name:'Compare learning on / off',exact:true}).click();
      await page.getByTestId('learning-comparison-status').filter({hasText:'12 of 12 runs complete'}).waitFor({timeout:180000});
      const [comparisonDownload] = await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export learning comparison',exact:true}).click()]);
      const comparison=JSON.parse(readFileSync(await comparisonDownload.path(),'utf8'));
      assert.equal(comparison.status,'completed'); assert.equal(comparison.runs.length,12);
      for (const r of comparison.runs) { assert.equal(r.ticks,1600); assert.equal(r.metrics.accounted,r.metrics.supplied); if (!r.definition.learning) assert.equal(r.updates,0); }
      for (const fixture of golden.cases) {
        const run = comparison.runs.find(r => r.definition.seed === fixture.seed && r.definition.learning === fixture.learning);
        assert.deepEqual(run.metrics, fixture.frames.at(-1).metrics);
      }
      assert.equal(await page.getByTestId('ecology-tick').textContent(),'1');
      // Advance actual living organisms before capturing the inspector.
      for (let i=1;i<20;i++) await page.getByRole('button',{name:'One step',exact:true}).click();
      assert.equal(await page.getByTestId('learning-updates').textContent(),'20');
      await page.getByText('See the inputs and actual weight changes',{exact:true}).click();
      if (type===chromium) {
        await page.evaluate(()=>scrollTo(0,0));
        await page.screenshot({path:`${captures}/desktop.png`,fullPage:true});
        writeFileSync(`${captures}/capture-state.json`,JSON.stringify({engine:'ecology-reference@3',seed:42,learning:true,tick:20,status:'paused',selected:1,browser:'Chromium',views:['desktop','phone-world','phone-organism','phone-setup']},null,2)+'\n');
      }
      for (const width of [390,320]) {
        await page.setViewportSize({width,height:844});
        const nav=page.getByRole('navigation',{name:'Living world views'});
        for (const [view,file] of [['World','phone-world'],['Organism','phone-organism'],['Setup','phone-setup']]) {
          await nav.getByRole('button',{name:view,exact:true}).click();
          assert.equal(await page.getByTestId('ecology-tick').textContent(),'20');
          assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
          if (type===chromium && width===390) { await page.evaluate(()=>scrollTo(0,0)); await page.screenshot({path:`${captures}/${file}.png`,fullPage:true}); }
        }
      }
      // New settings apply only after prepare; save/load keeps the v3 flag.
      await page.getByLabel('Enable lifetime learning',{exact:true}).uncheck();
      assert.match(await page.getByTestId('learning-mode').textContent(),/Learning on/);
      await page.getByRole('button',{name:'Save settings',exact:true}).click();
      await page.getByRole('button',{name:'Prepare new world',exact:true}).click();
      await page.getByRole('button',{name:'One step',exact:true}).click();
      const nav=page.getByRole('navigation',{name:'Living world views'});
      await nav.getByRole('button',{name:'Organism',exact:true}).click();
      assert.match(await page.getByTestId('learning-mode').textContent(),/Learning off/);
      assert.equal(await page.getByTestId('learning-updates').textContent(),'0');
      await nav.getByRole('button',{name:'Setup',exact:true}).click();
      const [settingsDownload]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export starting settings',exact:true}).click()]);
      const settings=JSON.parse(readFileSync(await settingsDownload.path(),'utf8'));
      assert.equal(settings.version,3); assert.equal(settings.learning,false);
      await page.getByLabel('Ecology settings file',{exact:true}).setInputFiles({name:'learning.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...settings,learning:true}))});
      await page.getByTestId('learning-mode').filter({hasText:'Learning on'}).waitFor({state:'attached'});
      await nav.getByRole('button',{name:'Setup',exact:true}).click();
      await page.getByRole('button',{name:'Load settings',exact:true}).click();
      assert.match(await page.getByTestId('learning-mode').textContent(),/Learning off/);
      assert.deepEqual(errors,[]); assert.deepEqual(external,[]);
      console.log(JSON.stringify({browser:type.name(),learning:'passed',comparison:'12 complete plus cancel',mobile:'320/390',externalRequests:0}));
    } finally { await browser.close(); }
  }
} finally { await stop(); }
