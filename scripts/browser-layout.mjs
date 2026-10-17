import assert from 'node:assert/strict';
import { chromium, firefox } from 'playwright';
import { mkdirSync } from 'node:fs';
import { startServer } from './browser-server.mjs';

const args = process.argv.slice(2);
assert(args.length === 0 || (args.length === 1 && args[0] === '--public'), 'Usage: node scripts/browser-layout.mjs [--public]');
const live = args[0] === '--public';
const stop = live ? async () => {} : await startServer('preview', 4184);
const url = live ? 'https://mankeluvsit.github.io/mathos/?lab=legacy&v=spacing2' : 'http://127.0.0.1:4184/?lab=legacy';
mkdirSync('.artifacts/layout', { recursive: true });
try {
  for (const type of live ? [chromium] : [chromium, firefox]) {
    const browser = await type.launch();
    try {
      const page = await browser.newPage();
      await page.goto(url);
      for (const width of [1024, 1600, 6400]) {
        // 6400 CSS pixels approximates a 1920px window at 30% browser zoom.
        await page.setViewportSize({ width, height: 1100 });
        const measure = () => page.evaluate(() => {
          const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left }; };
          return { world: rect('.ecology-world'), results: rect('.ecology-results'), inspect: rect('.ecology-inspect'), setup: rect('.ecology-setup'), overflow: document.documentElement.scrollWidth > innerWidth };
        });
        const check = async () => {
          const m = await measure();
          assert(Math.abs(m.results.top - m.world.bottom - 16) < 2, `Results must follow world without sidebar gap at ${width}px: ${JSON.stringify(m)}`);
          assert(Math.abs(m.setup.top - m.inspect.bottom - 16) < 2, 'Sidebar must also stack independently');
          assert(m.inspect.left > m.world.left && !m.overflow, 'Desktop columns must fit');
        };
        await check();
        const details = page.locator('.ecology-inspect details').first();
        if (await details.count()) {
          await details.evaluate(el => { el.open = !el.open; });
          await check();
        }
        if (width === 1600) await page.screenshot({ path: `.artifacts/layout/${type.name()}-${live ? 'public' : 'local'}.png`, fullPage: true });
      }
      await page.setViewportSize({ width: 390, height: 844 });
      const nav = page.getByRole('navigation', { name: 'Living world views' });
      for (const [view, selector] of [['World', '.ecology-world'], ['Organism', '.ecology-inspect'], ['Results', '.ecology-results'], ['Setup', '.ecology-setup']]) {
        await nav.getByRole('button', { name: view, exact: true }).click();
        assert(await page.locator(selector).isVisible(), `${view} view must remain reachable`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      }
      console.log(JSON.stringify({ browser: type.name(), layout: 'passed', widths: [1024, 1600, 6400], phoneViews: 'passed', live }));
    } finally { await browser.close(); }
  }
} finally { await stop(); }
