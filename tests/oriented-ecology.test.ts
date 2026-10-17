import { expect, it } from "vitest";
import {
  act,
  assertWorld,
  body,
  copy,
  initialize,
  intake,
  sense,
  step,
} from "../src/ecology/oriented-model";
import {
  canTurn,
  fits,
  parts,
  rotate,
  STEP,
} from "../src/ecology/oriented-geometry";
import * as dispatcher from "../src/ecology/world";
import * as legacy from "../src/ecology/model";
import { loadEcology, saveEcology } from "../src/ecology/storage";
const definition = {
  format: "mathos-ecology",
  version: 2,
  seed: 42,
  mode: "seeded",
} as const;
function organism() {
  return initialize(definition).creatures[0]!;
}
it("rotates every functional cell into all four headings", () => {
  const c = organism();
  c.x = 10;
  c.y = 10;
  expect(parts(c).map((p) => [p.x, p.y])).toEqual([
    [10, 10],
    [10, 9],
    [10, 11],
  ]);
  for (let d = 0; d < 4; d++) {
    const p = parts({ ...c, direction: d });
    expect(p[1]).toMatchObject({
      x: 10 + STEP[d]!.x,
      y: 10 + STEP[d]!.y,
      role: "mouth",
    });
    expect(new Set(p.map((p) => `${p.x},${p.y}`)).size).toBe(c.size);
  }
  expect(rotate(1, 0, 1)).toEqual({ x: 0, y: 1 });
});
it("turns at the anchor before moving forward, and reverses through two turns", () => {
  const c = organism(),
    before = { x: c.x, y: c.y };
  const energy = c.energy;
  expect(act(c, 1, new Set())).toBe(1);
  expect(c.direction).toBe(1);
  expect({ x: c.x, y: c.y }).toEqual(before);
  expect(c.energy).toBe(energy - 1);
  expect(act(c, 1, new Set())).toBe(2);
  expect(c.x).toBe(before.x + 1);
  expect(c.y).toBe(before.y);
  const r = organism();
  act(r, 2, new Set());
  expect(r.direction).toBe(1);
  act(r, 2, new Set());
  expect(r.direction).toBe(2);
  expect(r.x).toBe(before.x);
  expect(r.y).toBe(before.y);
});
it("rejects out-of-bounds poses and conservative corner-sweep collisions", () => {
  const c = organism();
  c.x = 10;
  c.y = 10;
  const diagonal = new Set([9 * 64 + 11]);
  expect(fits({ ...c, direction: 1 }, diagonal)).toBe(true);
  expect(canTurn(c, 1, diagonal)).toBe(false);
  expect(canTurn(c, 1, new Set())).toBe(true);
  expect(canTurn(c, 2, new Set())).toBe(false);
  expect(fits({ ...c, x: 0, direction: 3 }, new Set())).toBe(false);
  const blocked = new Set<number>();
  for (let y = 8; y <= 12; y++)
    for (let x = 8; x <= 12; x++)
      if (!body(c).includes(y * 64 + x)) blocked.add(y * 64 + x);
  const before = { x: c.x, y: c.y, direction: c.direction, energy: c.energy };
  expect(act(c, 1, blocked)).toBe(0);
  expect(c).toMatchObject(before);
});
it("rotates front-half-plane sensing with the body and hides food behind it", () => {
  const c = organism();
  c.x = 10;
  c.y = 10;
  const food = new Uint16Array(64 * 48);
  food[7 * 64 + 10] = 24;
  expect(sense(c, food)[0]).toBeGreaterThan(0);
  c.direction = 2;
  expect(sense(c, food)).toEqual([0, 0, 0, 0]);
  food.fill(0);
  c.direction = 1;
  food[10 * 64 + 13] = 24;
  expect(sense(c, food)[0]).toBeGreaterThan(0);
});
it("takes food through rotated mouths, with extra grazer intake and sensor range", () => {
  const s = initialize(definition),
    c = s.creatures[0]!;
  s.food.fill(0);
  c.x = 10;
  c.y = 10;
  c.direction = 1;
  c.energy = 100;
  s.food[10 * 64 + 12] = 24;
  expect(intake(s, c)).toBe(24);
  expect(c.energy).toBe(124);
  s.food.fill(0);
  c.genes.bodyPlan = "grazer";
  c.size = 4;
  c.direction = 0;
  c.energy = 100;
  s.food[8 * 64 + 10] = 24;
  s.food[10 * 64 + 12] = 24;
  expect(intake(s, c)).toBe(48);
  s.food.fill(0);
  c.genes.bodyPlan = "scout";
  s.food[2 * 64 + 10] = 24;
  expect(sense(c, s.food)[0]).toBeGreaterThan(0);
  c.size = 3;
  expect(sense(c, s.food)[0]).toBe(0);
});
it("replays bounded evolution, true body-plan mutations, development, families and exact resources", () => {
  let s = initialize(definition),
    replay = initialize(definition);
  const initial = copy(s);
  let developed = false;
  for (let i = 0; i < 1600; i++) {
    s = step(s);
    assertWorld(s);
    for (const c of s.creatures)
      if (c.age === 0) expect(c.desiredDirection).toBe(c.direction);
    developed ||= s.creatures.some((c) => c.parent !== null && c.size === 4);
    if ([40, 400, 1599].includes(i)) {
      while (replay.tick < s.tick) replay = step(replay);
      expect(s).toEqual(replay);
    }
  }
  expect(developed).toBe(true);
  expect(s.lineage.some((l) => l.mutation.startsWith("bodyPlan"))).toBe(true);
  expect(s.lineage.some((l) => l.deathReason === "starvation")).toBe(true);
  expect(s.history).toHaveLength(81);
  expect(s.lineage.length).toBeLessThanOrEqual(256);
  expect(s.events.length).toBeLessThanOrEqual(40);
  expect(initialize(definition)).toEqual(initial);
  expect(() => step(s)).toThrow("complete");
  for (const child of s.lineage.filter((l) => l.parent !== null)) {
    const parent = s.lineage.find((l) => l.id === child.parent)!;
    expect(child.family).toBe(parent.family);
    expect(child.generation).toBe(parent.generation + 1);
    if (!child.mutated) expect(child.genes).toEqual(parent.genes);
  }
});
it("protects nested histories, lineage birth genes and previous engine state", () => {
  const s = initialize(definition),
    before = copy(s);
  step(s);
  expect(s).toEqual(before);
  const snapshot = copy(s);
  snapshot.history[0]!.population = 999;
  snapshot.lineage[0]!.genes.sense = 99;
  expect(s).toEqual(before);
});
it("keeps v1 replay and storage separate and validates explicit versions", () => {
  const d = { ...definition, version: 1 } as const;
  const old = legacy.initializeEcology(d);
  expect(dispatcher.initializeEcology(d)).toEqual(old);
  expect(dispatcher.stepEcology(old)).toEqual(legacy.stepEcology(old));
  const values = new Map<string, string>(),
    port = {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => {
        values.set(k, v);
      },
    };
  saveEcology(port, d);
  saveEcology(port, definition);
  expect(loadEcology(port, 1)).toEqual(d);
  expect(loadEcology(port, 2)).toEqual(definition);
  values.set("mathos.ecology.v2", JSON.stringify(d));
  expect(() => loadEcology(port, 2)).toThrow("different model");
  expect(() =>
    dispatcher.validateEcology({ ...definition, version: 3 }),
  ).toThrow();
  expect(() => dispatcher.parseEcology(" ".repeat(65537))).toThrow();
});
it("never generates primordial organisms implicitly", () => {
  let s = initialize({ ...definition, mode: "primordial" });
  for (let i = 0; i < 30; i++) s = step(s);
  expect(s.creatures).toHaveLength(0);
  expect(s.lineage).toHaveLength(0);
});

it("exports measured observations with provenance without exposing live state or promising resume", async () => {
  const { exportObservations } = await import("../src/ecology/observations");
  let s = initialize(definition);
  for (let i = 0; i < 25; i++) s = step(s);
  const result = exportObservations(s);
  expect(result.tick).toBe(25);
  expect(result.history.at(-1)!.tick).toBe(20);
  expect(result.metrics.supplied).toBe(result.metrics.accounted);
  expect(result.definition.version).toBe(2);
  result.lineage[0]!.genes.sense = 99;
  expect(s.lineage[0]!.genes.sense).not.toBe(99);
  expect("food" in result).toBe(false);
});

it("reserves juvenile energy for motor development rather than unpowered turns", () => {
  const c = organism();
  c.size = 2;
  const before = { x: c.x, y: c.y, energy: c.energy, direction: c.direction };
  expect(act(c, 1, new Set())).toBe(0);
  expect(c).toMatchObject(before);
  expect(act(c, 0, new Set())).toBe(0);
  expect(c).toMatchObject(before);
});
