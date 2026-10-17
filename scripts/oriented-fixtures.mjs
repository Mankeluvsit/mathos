// Golden regression captures from the named TypeScript engine, not an independent oracle.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import {
  initialize as initializeEcology,
  step as stepEcology,
} from "../src/ecology/oriented-model.ts";
import { ecologyMetrics } from "../src/ecology/world.ts";
const cases = [];
for (const seed of [0, 42]) {
  let s = initializeEcology({
    format: "mathos-ecology",
    version: 2,
    seed,
    mode: "seeded",
  });
  const frames = [];
  for (let tick = 0; tick <= 1600; tick++) {
    if ([0, 20, 100, 400, 1600].includes(tick)) {
      const value = {
        tick: s.tick,
        rng: s.rng,
        food: Array.from(s.food),
        creatures: s.creatures,
        lineage: s.lineage,
        initial: s.initial,
        sunlight: s.sunlight,
        dissipated: s.dissipated,
        events: s.events,
        history: s.history,
      };
      frames.push({
        tick,
        sha256: createHash("sha256")
          .update(JSON.stringify(value))
          .digest("hex"),
        metrics: ecologyMetrics(s),
      });
    }
    if (tick < 1600) s = stepEcology(s);
  }
  cases.push({ seed, frames });
}
const text =
  JSON.stringify(
    {
      engine: "ecology-reference@2",
      provenance:
        "TypeScript golden regression capture; not an independent scientific reference",
      cases,
    },
    null,
    2,
  ) + "\n";
const path = new URL("../tests/fixtures/ecology-v2.json", import.meta.url);
if (process.argv.includes("--write")) writeFileSync(path, text);
else if (readFileSync(path, "utf8") !== text)
  throw Error("Ecology golden regression mismatch");
else console.log("Ecology golden regression fixtures match");
