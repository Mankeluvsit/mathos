import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { initialize, step } from "../src/ecology/oriented-model.ts";
import { planSize } from "../src/ecology/oriented-geometry.ts";
import { startServer } from "./browser-server.mjs";
let predicted = initialize({
  format: "mathos-ecology",
  version: 2,
  seed: 42,
  mode: "seeded",
});
let target;
while (predicted.tick < 1595 && !target) {
  predicted = step(predicted);
  const candidate = predicted.creatures.find(
    (c) =>
      c.size === planSize(c.genes.bodyPlan) &&
      predicted.lineage
        .find((l) => l.id === c.id)
        .mutation.startsWith("bodyPlan"),
  );
  if (candidate)
    target = {
      tick: predicted.tick,
      id: candidate.id,
      mutation: predicted.lineage.find((l) => l.id === candidate.id).mutation,
    };
}
if (!target)
  throw Error("No developed body-plan mutation in this capture seed");
const stop = await startServer("preview", 4178);
const dir = "/tmp/mathos-turning-previews";
mkdirSync(dir, { recursive: true });
try {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1050 },
    });
    await page.goto("http://127.0.0.1:4178/");
    await page.getByLabel("World speed", { exact: true }).selectOption("30");
    await page
      .getByRole("button", { name: "Start world", exact: true })
      .click();
    await page.waitForFunction(
      (tick) =>
        Number(
          document.querySelector('[data-testid="ecology-tick"]')?.textContent,
        ) >= tick,
      target.tick,
      { timeout: 90000 },
    );
    await page
      .getByRole("button", { name: "Pause world", exact: true })
      .click();
    await page
      .getByLabel("Select organism", { exact: true })
      .selectOption(String(target.id));
    await page
      .getByText("Family path & inherited changes", { exact: true })
      .click();
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${dir}/desktop.png`, fullPage: true });
    await page
      .locator(".ecology-evolution")
      .screenshot({ path: `${dir}/evolution.png` });
    const tick = Number(await page.getByTestId("ecology-tick").textContent());
    await page.setViewportSize({ width: 390, height: 844 });
    const nav = page.getByRole("navigation", { name: "Living world views" });
    await nav.getByRole("button", { name: "World", exact: true }).click();
    await page
      .getByLabel("World magnification", { exact: true })
      .selectOption("3");
    await page
      .getByRole("checkbox", { name: "Follow selected organism" })
      .check();
    for (const [name, file] of [
      ["World", "mobile-world"],
      ["Organism", "mobile-organism"],
      ["Setup", "mobile-setup"],
    ]) {
      await nav.getByRole("button", { name, exact: true }).click();
      await page.evaluate(() => scrollTo(0, 0));
      if (name === "World")
        await page.locator(".ecology-camera-frame").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${dir}/${file}.png` });
    }
    writeFileSync(
      `${dir}/state.json`,
      JSON.stringify(
        {
          model: 2,
          seed: 42,
          tick,
          selected: target.id,
          mutation: target.mutation,
        },
        null,
        2,
      ),
    );
    console.log(
      `Captured actual model 2 at step ${tick}, selected descendant ${target.id}`,
    );
  } finally {
    await browser.close();
  }
} finally {
  await stop();
}
