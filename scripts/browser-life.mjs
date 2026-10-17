import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, firefox } from 'playwright';
import { startServer } from './browser-server.mjs';
const stop = await startServer('preview', 4176);
const captures = '/tmp/mathos-life-previews'; mkdirSync(captures, { recursive: true });
try {
  for (const type of [chromium, firefox]) {
    const browser = await type.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 1600, height: 1050 } });
      const errors = [], external = [];
      page.on('pageerror', e => errors.push(String(e)));
      page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1:4176')) external.push(r.url()); });
      let accept = true; page.on('dialog', d => accept ? d.accept() : d.dismiss());
      await page.goto('http://127.0.0.1:4176/?lab=reference');
      await page.getByRole('button', { name: 'Open life baseline', exact: true }).click();
      const tick = page.getByTestId('life-tick'); await tick.waitFor(); assert.equal(await tick.textContent(), '0');
      await page.getByLabel('Life width', { exact: true }).fill('16'); await page.getByLabel('Life height', { exact: true }).fill('16');
      await page.getByRole('button', { name: 'Prepare life from draft', exact: true }).click();
      const accounted = await page.getByTestId('life-accounted').textContent();
      for (let i = 0; i < 40; i++) await page.getByRole('button', { name: 'Step life', exact: true }).click();
      assert.equal(await tick.textContent(), '40'); assert.equal(await page.getByTestId('life-accounted').textContent(), accounted);
      assert(Number(await page.getByTestId('life-births').textContent()) > 1);
      await page.getByRole('button', { name: 'Start life', exact: true }).click(); await page.waitForTimeout(350);
      await page.getByRole('button', { name: 'Pause life', exact: true }).click(); assert(Number(await tick.textContent()) > 40);
      accept = false; await page.getByRole('button', { name: 'Reset life', exact: true }).click(); const pausedTick = await tick.textContent(); assert(Number(pausedTick) > 40);
      // Active definition and copied field survive mobile view switches.
      await page.setViewportSize({ width: 390, height: 844 });
      const nav = page.getByRole('navigation', { name: 'Life workspace' });
      for (const name of ['Setup', 'Inspect', 'Viewport']) { await nav.getByRole('button', { name, exact: true }).click(); assert.equal(await tick.textContent(), pausedTick); }
      assert(await page.locator('.life-viewport').isVisible()); assert(!await page.locator('.life-inspect').isVisible());
      const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: innerWidth })); assert(dimensions.scroll <= dimensions.width);
      if (type === chromium) {
        await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: `${captures}/mobile-viewport.png` });
        await nav.getByRole('button', { name: 'Inspect', exact: true }).click(); await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: `${captures}/mobile-inspect.png` });
        await nav.getByRole('button', { name: 'Setup', exact: true }).click(); await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: `${captures}/mobile-setup.png` });
      }
      await nav.getByRole('button', { name: 'Inspect', exact: true }).click();
      await page.getByLabel('Life pixel x', { exact: true }).fill('8'); await page.getByLabel('Life pixel y', { exact: true }).fill('8');
      assert((await page.locator('.life-inspect').textContent()).includes('Resource:'));
      await page.setViewportSize({ width: 1600, height: 1050 });
      if (type === chromium) { await page.screenshot({ path: `${captures}/desktop.png`, fullPage: true }); writeFileSync(`${captures}/state.json`, JSON.stringify({ seed: 42, width: 16, height: 16, tick: Number(pausedTick), genesis: 'seeded', boundary: 'periodic', divisor: 8 }, null, 2)); }
      // Save draft/export active/import restart and corrupt-data handling.
      await page.getByRole('button', { name: 'Save life draft', exact: true }).click();
      const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export active life definition', exact: true }).click()]);
      const path = await download.path(); assert(path);
      accept = true; await page.getByLabel('Life definition file', { exact: true }).setInputFiles(path);
      await page.waitForFunction(() => document.querySelector('[data-testid="life-tick"]')?.textContent === '0');
      assert.equal(await page.getByTestId('life-population').textContent(), '1');
      await page.getByRole('button', { name: 'Step life', exact: true }).click();
      await page.getByRole('button', { name: 'Prepare life from draft', exact: true }).click(); assert.equal(await tick.textContent(), '0');
      await page.getByLabel('Life definition file', { exact: true }).setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"format":"bad"}') });
      await page.getByText('Life definition must contain exactly the documented fields.', { exact: true }).waitFor(); assert.equal(await tick.textContent(), '0');
      await page.evaluate(() => localStorage.setItem('mathos.life-run.v1', 'broken'));
      await page.getByRole('button', { name: 'Load life saved', exact: true }).click(); assert.equal(await tick.textContent(), '0');
      // Batch cancellation is bounded and completed comparisons keep the interactive state intact.
      await page.getByRole('button', { name: 'Compare three seeds', exact: true }).click();
      await page.getByRole('button', { name: 'Cancel comparison', exact: true }).click();
      await page.getByRole('caption').filter({ hasText: 'cancelled' }).waitFor(); assert.equal(await tick.textContent(), '0');
      await page.getByRole('button', { name: 'Compare three seeds', exact: true }).click();
      await page.getByRole('caption').filter({ hasText: 'completed' }).waitFor({ timeout: 30000 }); assert.equal(await tick.textContent(), '0');
      const rows = page.locator('.life-batch tbody tr'); assert.equal(await rows.count(), 3);
      await page.getByLabel('Life genesis', { exact: true }).selectOption('primordial');
      await page.getByRole('button', { name: 'Prepare life from draft', exact: true }).click(); assert.equal(await page.getByTestId('life-population').textContent(), '0');
      await page.getByRole('button', { name: 'Step life', exact: true }).click(); assert.equal(await page.getByTestId('life-population').textContent(), '0');
      await page.setViewportSize({ width: 320, height: 700 });
      for (const name of ['Viewport', 'Setup', 'Inspect']) {
        await nav.getByRole('button', { name, exact: true }).click();
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      }
      assert.deepEqual(errors, []); assert.deepEqual(external, []);
      console.log(JSON.stringify({ browser: type.name(), lifeWorkflow: 'passed', comparison: 'passed', responsive: '320/390/1600', externalRequests: 0 }));
    } finally { await browser.close(); }
  }
} finally { await stop(); }
