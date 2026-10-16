/** Dispatch without migrating old experiment semantics. */
import * as legacy from "./model.ts";
import * as oriented from "./oriented-model.ts";
import { parts, type Role } from "./oriented-geometry.ts";
export const { W, H, END } = legacy;
export type EcologyDefinition = legacy.EcologyDefinition | oriented.Definition;
export type Ecology = legacy.Ecology | oriented.World;
export type Creature = legacy.Creature | oriented.Creature;
export function isOriented(s: Ecology): s is oriented.World {
  return s.definition.version === 2;
}
export function isOrientedCreature(c: Creature): c is oriented.Creature {
  return "bodyPlan" in c.genes;
}
export function validateEcology(v: unknown): EcologyDefinition {
  return v && typeof v === "object" && "version" in v && v.version === 2
    ? oriented.validate(v)
    : legacy.validateEcology(v);
}
export function parseEcology(text: string) {
  if (new TextEncoder().encode(text).byteLength > 65536)
    throw Error("Definition exceeds 64 KiB.");
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw Error("Invalid ecology JSON.");
  }
  return validateEcology(value);
}
export function initializeEcology(d: EcologyDefinition): Ecology {
  return d.version === 2 ? oriented.initialize(d) : legacy.initializeEcology(d);
}
export function copyEcology(s: Ecology): Ecology {
  return isOriented(s) ? oriented.copy(s) : legacy.copyEcology(s);
}
export function stepEcology(s: Ecology): Ecology {
  return isOriented(s) ? oriented.step(s) : legacy.stepEcology(s);
}
export function body(c: Creature): number[] {
  return isOrientedCreature(c) ? oriented.body(c) : legacy.body(c);
}
export function cellParts(
  c: Creature,
): Array<{ x: number; y: number; role: Role }> {
  return isOrientedCreature(c)
    ? parts(c)
    : legacy
        .body(c)
        .map((p, i) => ({
          x: p % W,
          y: Math.floor(p / W),
          role: i === 0 ? "body" : i === 1 ? "mouth" : "motor",
        }));
}
export function ecologyMetrics(s: Ecology) {
  let foodEnergy = 0,
    pellets = 0;
  for (const v of s.food) {
    foodEnergy += v;
    if (v) pellets++;
  }
  const stores = s.creatures.reduce((n, c) => n + c.energy, 0),
    structure = s.creatures.reduce((n, c) => n + c.size * 8, 0);
  return {
    population: s.creatures.length,
    pellets,
    births: s.lineage.length - (s.definition.mode === "seeded" ? 8 : 0),
    deaths: s.lineage.filter((l) => l.died !== null).length,
    generation: Math.max(0, ...s.lineage.map((l) => l.generation)),
    foodEnergy,
    stores,
    structure,
    dissipated: s.dissipated,
    supplied: s.initial + s.sunlight,
    accounted: foodEnergy + stores + structure + s.dissipated,
  };
}
