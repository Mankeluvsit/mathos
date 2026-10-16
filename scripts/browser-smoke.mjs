import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startServer } from './browser-server.mjs';
import { chromium, firefox } from 'playwright';

const reference = JSON.parse(readFileSync(new URL('../tests/fixtures/substrate/reference.json', import.meta.url)));
const runExample = JSON.parse(readFileSync(new URL('../examples/substrate-run.v1.json', import.meta.url)));

async function checkPage(browser, browserType) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  const externalRequests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4173') && !request.url().startsWith('ws://127.0.0.1:4173')) externalRequests.push(request.url());
  });
  await page.goto('http://127.0.0.1:4173/?lab=reference');
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
  assert.deepEqual(pixel, [16, 36, 58, 255]);
  await page.getByLabel('Width (pixels)').fill('8');
  await page.getByLabel('Height (pixels)').fill('8');
  await page.getByLabel('Random seed').fill('0');
  await page.getByRole('button', { name: 'Open substrate lab' }).click();
  const lab = page.getByRole('region', { name: 'Substrate laboratory' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await lab.getByRole('button', { name: 'Prepare substrate from draft' }).click();
  assert.equal(await lab.getByTestId('tick').textContent(), '0');
  await page.waitForTimeout(100);
  assert.equal(await lab.getByTestId('tick').textContent(), '0', 'No automatic run');
  const golden = reference.cases[0].frames.find((frame) => frame.tick === 10);
  for (let i = 0; i < 10; i++) await lab.getByRole('button', { name: 'Step', exact: true }).click();
  assert.equal(await lab.getByTestId('tick').textContent(), '10');
  assert.equal(Number(await lab.getByTestId('field-total').textContent()), golden.sum);
  assert.equal(Number(await lab.getByTestId('field-min').textContent()), golden.min);
  assert.equal(Number(await lab.getByTestId('field-max').textContent()), golden.max);
  for (const i of [0, 7, 8, 27, 63]) {
    await lab.getByLabel('Pixel x').fill(String(i % 8));
    await lab.getByLabel('Pixel y').fill(String(Math.floor(i / 8)));
    assert.equal(Number(await lab.getByTestId('pixel-value').textContent()), golden.field[i]);
  }
  await lab.getByRole('button', { name: 'Save run definition' }).click();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mathos.experiment.v1')).name), 'Browser verified');
  const runDownloadReady = page.waitForEvent('download');
  await lab.getByRole('button', { name: 'Export run JSON' }).click();
  const runDownload = await runDownloadReady;
  assert.equal(runDownload.suggestedFilename(), 'mathos-substrate-run.v1.json');
  const runStream = await runDownload.createReadStream();
  let runJSON = '';
  for await (const chunk of runStream) runJSON += chunk.toString();
  assert.equal(JSON.parse(runJSON).format, 'mathos-substrate-run');
  assert.equal(Object.hasOwn(JSON.parse(runJSON), 'tick'), false);
  await lab.getByRole('button', { name: 'Start', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => Number(document.querySelector('[data-testid="tick"]').textContent) > 10);
  await lab.getByRole('button', { name: 'Pause', exact: true }).focus();
  await page.keyboard.press('Enter');
  const pausedTick = await lab.getByTestId('tick').textContent();
  await page.waitForTimeout(100);
  assert.equal(await lab.getByTestId('tick').textContent(), pausedTick);
  await lab.getByRole('button', { name: 'Reset substrate' }).click();
  await lab.getByRole('button', { name: 'Keep current run' }).click();
  assert.equal(await lab.getByTestId('tick').textContent(), pausedTick);
  await lab.getByRole('button', { name: 'Reset substrate' }).click();
  assert.equal(await lab.getByRole('group', { name: 'Confirm discarding progress' }).evaluate((el) => el === document.activeElement), true);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  assert.equal(await lab.getByTestId('tick').textContent(), '0');
  const replacement = { ...runExample, universe: { width: 8, height: 8 }, seed: 4294967295, initializer: { id: 'center-impulse', version: 1 }, rules: { ...runExample.rules, transferDivisor: 16 } };
  await lab.getByLabel('Import substrate definition file').setInputFiles({ name: 'run.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(replacement)) });
  await lab.getByRole('heading', { name: 'Active substrate: Reference substrate' }).waitFor();
  await lab.getByRole('button', { name: 'Step', exact: true }).click();
  assert.equal(Number(await lab.getByTestId('field-max').textContent()), reference.cases[2].frames.find((f) => f.tick === 1).max);
  await lab.getByLabel('Import substrate definition file').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
  await lab.getByText('Substrate definition is not valid JSON.').waitFor();
  assert.equal(await lab.getByTestId('tick').textContent(), '1');
  const focusTick = await lab.getByTestId('tick').textContent();
  await page.getByRole('button', { name: 'Focus viewport' }).click();
  assert.equal(await page.getByLabel('Experiment name').isVisible(), false);
  assert.equal(await lab.locator('canvas').isVisible(), true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('navigation', { name: 'Mobile workspace' }).getByRole('button', { name: 'Setup', exact: true }).click();
  assert.equal(await page.getByLabel('Experiment name').isVisible(), true, 'Desktop focus must not hide mobile setup');
  await page.getByRole('navigation', { name: 'Mobile workspace' }).getByRole('button', { name: 'Inspect', exact: true }).click();
  assert.equal(await lab.getByLabel('Pixel x').isVisible(), true);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole('button', { name: 'Exit focus' }).click();
  assert.equal(await page.getByLabel('Experiment name').isVisible(), true);
  assert.equal(await lab.getByTestId('tick').textContent(), focusTick);
  const tickBeforeViews = await lab.getByTestId('tick').textContent();
  const totalBeforeViews = await lab.getByTestId('field-total').textContent();
  await lab.getByLabel('Field palette').selectOption('grayscale');
  assert.equal(await lab.getByTestId('tick').textContent(), tickBeforeViews);
  assert.equal(await lab.getByTestId('field-total').textContent(), totalBeforeViews);
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = page.getByRole('navigation', { name: 'Mobile workspace' });
  await mobile.getByRole('button', { name: 'Inspect', exact: true }).click();
  assert.equal(await lab.getByLabel('Pixel x').isVisible(), true);
  assert.equal(await lab.locator('canvas').isVisible(), false);
  assert.equal(await lab.getByTestId('tick').textContent(), tickBeforeViews);
  await mobile.getByRole('button', { name: 'Setup', exact: true }).click();
  assert.equal(await page.getByLabel('Experiment name').isVisible(), true);
  assert.equal(await lab.getByLabel('Initial field').isVisible(), true);
  assert.equal(await lab.getByLabel('Field palette').isVisible(), true);
  assert.equal(await lab.getByLabel('Display rate').isVisible(), true);
  await mobile.getByRole('button', { name: 'Viewport', exact: true }).click();
  assert.equal(await lab.locator('canvas').isVisible(), true);
  assert.equal(await lab.getByTestId('tick').textContent(), tickBeforeViews);
  assert.equal(await lab.getByTestId('field-total').textContent(), totalBeforeViews);
  for (const width of [640, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Horizontal overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 640, height: 900 });
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Reflow at 200% CSS zoom');
  await page.evaluate(() => { document.documentElement.style.zoom = '1'; });
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.screenshot({ path: `/tmp/mathos-phase1-${browserType.name()}.png`, fullPage: true });
  await page.evaluate(() => Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('blocked storage'); } }));
  await lab.getByRole('button', { name: 'Save run definition' }).click();
  await lab.getByText('Local storage is unavailable. Import/export still works.').waitFor();
  const recoveryDownload = page.waitForEvent('download');
  await lab.getByRole('button', { name: 'Export run JSON' }).click();
  await recoveryDownload;
  assert.deepEqual(errors, []);
  assert.deepEqual(externalRequests, []);
  console.log(`${browserType.name()} production browser smoke passed: keyboard controls, golden ticks, definitions, pause/reset, native Canvas, 320px/200% reflow, storage fallback, no external requests.`);
}

const stop = await startServer('preview', 4173);
try {
  for (const browserType of [chromium, firefox]) {
    const browser = await browserType.launch({ headless: true });
    try { await checkPage(browser, browserType); }
    finally { await browser.close(); }
  }
} finally { await stop(); }
