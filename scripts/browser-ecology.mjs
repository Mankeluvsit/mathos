import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { chromium, firefox } from "playwright";
import { startServer } from "./browser-server.mjs";
const stop = await startServer("preview", 4177),
  captures = "/tmp/mathos-ecology-previews";
mkdirSync(captures, { recursive: true });
try {
  for (const type of [chromium, firefox]) {
    const browser = await type.launch();
    try {
      const page = await browser.newPage({
          viewport: { width: 1600, height: 1050 },
        }),
        errors = [],
        requests = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("request", (r) => {
        if (!r.url().startsWith("http://127.0.0.1:4177/"))
          requests.push(r.url());
      });
      let accept = true;
      page.on("dialog", (d) => (accept ? d.accept() : d.dismiss()));
      await page.goto("http://127.0.0.1:4177/");
      await page.getByLabel("Simulation model", {exact: true}).selectOption("2");
      await page.getByRole("button", {name: "Prepare new world", exact: true}).click();
      assert.equal(
        await page.getByTestId("ecology-population").textContent(),
        "8",
      );
      await page
        .getByLabel("Select organism", { exact: true })
        .selectOption("3");
      await page.getByRole("img", {name: /Living world/}).scrollIntoViewIfNeeded();
      const box = await page
        .getByRole("img", { name: /Living world/ })
        .boundingBox();
      await page.mouse.click(
        box.x + (8.5 / 64) * box.width,
        box.y + (11.5 / 48) * box.height,
      );
      assert(
        (await page.getByTestId("organism-heading").textContent()).includes(
          "north",
        ),
      );
      await page
        .getByRole("heading", { name: "Organism #1", exact: true })
        .waitFor();
      await page
        .getByRole("button", { name: "Start world", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          Number(
            document.querySelector('[data-testid="ecology-tick"]')?.textContent,
          ) >= 20,
      );
      await page
        .getByRole("button", { name: "Pause world", exact: true })
        .click();
      await page.getByRole("button", { name: "One step", exact: true }).click();
      let tick = await page.getByTestId("ecology-tick").textContent();
      assert.equal(
        await page.getByTestId("ecology-status").textContent(),
        "paused",
      );
      const [observationDownload] = await Promise.all([
        page.waitForEvent("download"),
        page
          .getByRole("button", { name: "Export observations", exact: true })
          .click(),
      ]);
      const observation = JSON.parse(
        readFileSync(await observationDownload.path(), "utf8"),
      );
      assert.equal(observation.format, "mathos-ecology-observations");
      assert.equal(observation.tick, Number(tick));
      assert.equal(observation.metrics.supplied, observation.metrics.accounted);
      const canvas = page.getByRole("img", { name: /Living world/ });
      assert(await canvas.isVisible());
      if (type === chromium) {
        await page.screenshot({
          path: `${captures}/desktop.png`,
          fullPage: true,
        });
        writeFileSync(
          `${captures}/state.json`,
          JSON.stringify({ seed: 42, tick: Number(tick) }, null, 2),
        );
      }
      await page.setViewportSize({ width: 390, height: 844 });
      const nav = page.getByRole("navigation", { name: "Living world views" });
      await nav.getByRole("button", { name: "World", exact: true }).click();
      await page
        .getByLabel("World magnification", { exact: true })
        .selectOption("2");
      await page
        .getByRole("checkbox", { name: "Follow selected organism" })
        .check();
      await nav.getByRole('button',{name:'Start',exact:true}).click();
      await page.waitForTimeout(160);
      await nav.getByRole('button',{name:'Pause',exact:true}).click();
      // The view tests below preserve the new paused tick after testing fixed playback.
      tick = await page.getByTestId('ecology-tick').textContent();
      for (const [button, file] of [
        ["World", "mobile-world"],
        ["Organism", "mobile-organism"],
        ["Setup", "mobile-setup"],
      ]) {
        await nav.getByRole("button", { name: button, exact: true }).click();
        assert.equal(
          await page.getByTestId("ecology-tick").textContent(),
          tick,
        );
        await page.evaluate(() => scrollTo(0, 0));
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        if (type === chromium)
          await page.screenshot({ path: `${captures}/${file}.png` });
      }
      await nav.getByRole("button", { name: "World", exact: true }).click();
      accept = false;
      await page
        .getByRole("button", { name: "Restart world", exact: true })
        .click();
      assert.equal(await page.getByTestId("ecology-tick").textContent(), tick);
      accept = true;
      await nav.getByRole("button", { name: "Setup", exact: true }).click();
      await page
        .getByRole("button", { name: "Save settings", exact: true })
        .click();
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page
          .getByRole("button", {
            name: "Export starting settings",
            exact: true,
          })
          .click(),
      ]);
      const exported = JSON.parse(readFileSync(await download.path(), "utf8"));
      assert.equal(exported.format, "mathos-ecology");
      assert.equal(exported.version, 2);
      await page
        .getByLabel("Ecology settings file", { exact: true })
        .setInputFiles({
          name: "invalid.json",
          mimeType: "application/json",
          buffer: Buffer.from('{"format":"wrong"}'),
        });
      await page.getByText(/Unsupported ecology definition/).waitFor();
      assert.equal(await page.getByTestId("ecology-tick").textContent(), tick);
      await page
        .getByLabel("Starting population", { exact: true })
        .selectOption("primordial");
      await page
        .getByRole("button", { name: "Prepare new world", exact: true })
        .click();
      assert.equal(
        await page.getByTestId("ecology-population").textContent(),
        "0",
      );
      assert.equal(await page.getByTestId("ecology-tick").textContent(), "0");
      await nav.getByRole("button", { name: "Setup", exact: true }).click();
      await page
        .getByRole("button", { name: "Load settings", exact: true })
        .click();
      assert.equal(
        await page.getByTestId("ecology-population").textContent(),
        "8",
      );
      await page.setViewportSize({ width: 320, height: 720 });
      for (const name of ["World", "Organism", "Setup"]) {
        await nav.getByRole("button", { name, exact: true }).click();
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
      }
      assert.deepEqual(errors, []);
      assert.deepEqual(requests, []);
      console.log(
        JSON.stringify({
          browser: type.name(),
          ecology: "passed",
          mobile: "320/390",
          externalRequests: 0,
        }),
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  await stop();
}
