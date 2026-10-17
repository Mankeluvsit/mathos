import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { startServer } from './browser-server.mjs';

const directory = '/tmp/mathos-dashboard-previews';
await mkdir(directory, { recursive: true });
const stop = await startServer('preview', 4175);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1040 } });
  await page.goto('http://127.0.0.1:4175/?lab=reference');
  await page.getByLabel('Experiment name').fill('Substrate experiment 01');
  await page.getByRole('button', { name: 'Open substrate lab' }).click();
  await page.getByRole('button', { name: 'Prepare substrate from draft' }).click();
  await page.getByRole('button', { name: 'Step', exact: true }).click();
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: `${directory}/desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  const navigation = page.getByRole('navigation', { name: 'Mobile workspace' });
  for (const [name, file] of [['Viewport', 'mobile-viewport'], ['Setup', 'mobile-setup'], ['Inspect', 'mobile-inspect']]) {
    await navigation.getByRole('button', { name, exact: true }).click();
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${directory}/${file}.png`, fullPage: false });
  }
  console.log(`Captured desktop and three real phone workspace views in ${directory}`);
} finally { await browser.close(); await stop(); }
