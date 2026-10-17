/** Dispatch without migrating old experiment semantics. */
import * as legacy from "./model.ts";
import * as genome from "./genome-model.ts";
import { parts as genomeParts } from "./body-genome.ts";
import * as learning from "./learning-model.ts";
import * as oriented from "./oriented-model.ts";
import { parts, type Role } from "./oriented-geometry.ts";
export const { W, H, END } = legacy;
export type EcologyDefinition = legacy.EcologyDefinition | oriented.Definition | learning.Definition | genome.Definition;
export type Ecology = legacy.Ecology | oriented.World | learning.World | genome.World;
export type Creature = legacy.Creature | oriented.Creature | learning.Creature | genome.Creature;
export function isOriented(s: Ecology): s is oriented.World | learning.World | genome.World {
  return s.definition.version >= 2;
}
export function isOrientedCreature(c: Creature): c is oriented.Creature | learning.Creature | genome.Creature {
  return "bodyPlan" in c.genes;
}
export function isGenome(s: Ecology): s is genome.World { return s.definition.version === 4; }
export function isGenomeCreature(c: Creature): c is genome.Creature { return "layout" in c.genes; }
export function isLearning(s: Ecology): s is learning.World | genome.World { return s.definition.version === 3 || s.definition.version === 4; }
export function validateEcology(v: unknown): EcologyDefinition {
  if (v && typeof v === "object" && "version" in v && v.version === 4) return genome.validate(v);
  if (v && typeof v === "object" && "version" in v && v.version === 3) return learning.validate(v);
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
  if (d.version === 4) return genome.initialize(d);
  if (d.version === 3) return learning.initialize(d);
  return d.version === 2 ? oriented.initialize(d) : legacy.initializeEcology(d);
}
export function copyEcology(s: Ecology): Ecology {
  if (isGenome(s)) return genome.copy(s);
  if (isLearning(s)) return learning.copy(s);
  return isOriented(s) ? oriented.copy(s) : legacy.copyEcology(s);
}
export function stepEcology(s: Ecology): Ecology {
  if (isGenome(s)) return genome.step(s);
  if (isLearning(s)) return learning.step(s);
  return isOriented(s) ? oriented.step(s) : legacy.stepEcology(s);
}
export function body(c: Creature): number[] {
  if (isGenomeCreature(c)) return genome.body(c);
  return isOrientedCreature(c) ? oriented.body(c) : legacy.body(c);
}
export function cellParts(
  c: Creature,
): Array<{ x: number; y: number; role: Role }> {
  if (isGenomeCreature(c)) return genomeParts(c);
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
