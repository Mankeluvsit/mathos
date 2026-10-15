import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const server = spawn('npm', ['run', 'dev', '--', '--port', '4173', '--strictPort'], { stdio: 'inherit' });
let browser;
try {
  for (let attempt = 0; ; attempt++) {
    try { const response = await fetch('http://127.0.0.1:4173'); if (response.ok) break; }
    catch { /* Server is starting. */ }
    if (attempt >= 50) throw new Error('Development server did not start.');
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  const externalRequests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4173') && !request.url().startsWith('ws://127.0.0.1:4173')) externalRequests.push(request.url());
  });
  await page.goto('http://127.0.0.1:4173');
  await page.getByRole('heading', { level: 1 }).waitFor();
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').textContent(), 'Skip to configuration');
  await page.keyboard.press('Enter');
  await page.getByRole('textbox', { name: 'Experiment name' }).fill('Browser verified');
  await page.getByRole('button', { name: 'Save locally' }).click();
  await page.getByRole('textbox', { name: 'Experiment name' }).fill('Unsaved');
  await page.getByRole('button', { name: 'Load saved' }).click();
  assert.equal(await page.getByRole('textbox', { name: 'Experiment name' }).inputValue(), 'Browser verified');
  const downloadReady = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadReady;
  assert.equal(download.suggestedFilename(), 'mathos-experiment.v1.json');
  const stream = await download.createReadStream();
  let json = '';
  for await (const chunk of stream) json += chunk.toString();
  assert.equal(JSON.parse(json).name, 'Browser verified');
  const imported = { ...JSON.parse(json), name: 'Browser imported', genesis: { mode: 'seeded' } };
  await page.getByLabel('Import configuration file').setInputFiles({ name: 'experiment.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported)) });
  await page.waitForFunction(() => document.querySelector('#name').value === 'Browser imported');
  const pixel = await page.locator('canvas').evaluate((canvas) => [...canvas.getContext('2d').getImageData(0, 0, 1, 1).data]);
  assert.deepEqual(pixel, [23, 60, 48, 255]);
  for (const width of [640, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Horizontal overflow at ${width}px`);
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(externalRequests, []);
  console.log('Browser smoke passed: keyboard entry, save/load, JSON download/upload, native Canvas, 320px reflow, no external requests.');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
