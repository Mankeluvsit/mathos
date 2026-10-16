import { nextRandom } from "../simulation/rng.ts";
import {
  W,
  H,
  END,
  type Creature as OldCreature,
  type Genes as OldGenes,
  type Ancestor as OldAncestor,
} from "./model.ts";
import {
  canTurn,
  fits,
  parts,
  planSize,
  PLANS,
  STEP,
  type BodyPlan,
} from "./oriented-geometry.ts";
export { W, H, END, parts, canTurn, fits };
export interface Definition {
  format: "mathos-ecology";
  version: 2;
  seed: number;
  mode: "seeded" | "primordial";
}
export interface Genes extends OldGenes {
  bodyPlan: BodyPlan;
}
export interface Creature extends OldCreature {
  genes: Genes;
  desiredDirection: number;
  intake: number;
  distance: number;
  turns: number;
  signals: number[];
}
export interface Ancestor extends OldAncestor {
  family: number;
  genes: Genes;
  mutation: string;
  intake: number;
  distance: number;
  turns: number;
  deathReason: string;
}
export interface Sample {
  tick: number;
  population: number;
  pellets: number;
  dart: number;
  grazer: number;
  scout: number;
}
export interface World {
  definition: Definition;
  tick: number;
  rng: number;
  food: Uint16Array;
  creatures: Creature[];
  lineage: Ancestor[];
  initial: number;
  sunlight: number;
  dissipated: number;
  events: string[];
  history: Sample[];
}
export function validate(input: unknown): Definition {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw Error("Expected an ecology definition.");
  const d = input as Record<string, unknown>;
  if (
    Object.keys(d).length !== 4 ||
    !["format", "version", "seed", "mode"].every((k) => Object.hasOwn(d, k)) ||
    d.format !== "mathos-ecology" ||
    d.version !== 2 ||
    !Number.isInteger(d.seed) ||
    (d.seed as number) < 0 ||
    (d.seed as number) > 4294967295 ||
    (d.mode !== "seeded" && d.mode !== "primordial")
  )
    throw Error(
      "Unsupported ecology definition. Expected version 2, uint32 seed and seeded/primordial mode.",
    );
  return Object.freeze({
    format: "mathos-ecology",
    version: 2,
    seed: d.seed as number,
    mode: d.mode,
  });
}
function draw(s: World) {
  const r = nextRandom(s.rng);
  s.rng = r.state;
  return r.value;
}
export function body(c: Creature) {
  return parts(c).map((p) => p.y * W + p.x);
}
function event(s: World, text: string) {
  s.events.unshift(`Step ${s.tick + 1}: ${text}`);
  s.events.length = Math.min(40, s.events.length);
}
function placeFood(s: World, attempts: number) {
  let supplied = 0;
  const occupied = new Set(s.creatures.flatMap(body));
  for (let i = 0; i < attempts; i++) {
    const p = draw(s) % (W * H);
    if (!s.food[p] && !occupied.has(p)) {
      s.food[p] = 24;
      supplied += 24;
    }
  }
  return supplied;
}
export function sample(s: World): Sample {
  return {
    tick: s.tick,
    population: s.creatures.length,
    pellets: s.food.reduce((n, v) => n + Number(v > 0), 0),
    dart: s.creatures.filter((c) => c.genes.bodyPlan === "dart").length,
    grazer: s.creatures.filter((c) => c.genes.bodyPlan === "grazer").length,
    scout: s.creatures.filter((c) => c.genes.bodyPlan === "scout").length,
  };
}
function founder(id: number): Creature {
  return {
    id,
    parent: null,
    generation: 0,
    x: 8 + ((id - 1) % 4) * 14,
    y: 12 + Math.floor((id - 1) / 4) * 23,
    size: planSize(PLANS[(id - 1) % 3]!),
    energy: 120,
    age: 0,
    lastBirth: -80,
    direction: (id - 1) % 4,
    genes: {
      sense: 6,
      foodWeight: 3,
      inertia: 2,
      lifespan: 600,
      bodyPlan: PLANS[(id - 1) % 3]!,
    },
    action: "Ready to explore",
    scores: [0, 0, 0, 0],
    signals: [0, 0, 0, 0],
    desiredDirection: (id - 1) % 4,
    intake: 0,
    distance: 0,
    turns: 0,
  };
}
export function initialize(input: Definition): World {
  const definition = validate(input);
  const s: World = {
    definition,
    tick: 0,
    rng: definition.seed,
    food: new Uint16Array(W * H),
    creatures: [],
    lineage: [],
    initial: 0,
    sunlight: 0,
    dissipated: 0,
    events: [],
    history: [],
  };
  s.initial = placeFood(s, 360);
  if (definition.mode === "seeded")
    for (let id = 1; id <= 8; id++) {
      const c = founder(id);
      s.creatures.push(c);
      s.initial += c.energy + c.size * 8;
      s.lineage.push({
        id,
        parent: null,
        family: id,
        generation: 0,
        born: 0,
        died: null,
        mutated: false,
        genes: { ...c.genes },
        mutation: "",
        intake: 0,
        distance: 0,
        turns: 0,
        deathReason: "",
      });
    }
  s.events = [
    "World prepared: dart, grazer and scout families. Bodies turn before moving forward.",
  ];
  s.history.push(sample(s));
  assertWorld(s);
  return s;
}
export function copy(s: World): World {
  return {
    ...s,
    food: s.food.slice(),
    creatures: s.creatures.map((c) => ({
      ...c,
      genes: { ...c.genes },
      scores: [...c.scores],
      signals: [...c.signals],
    })),
    lineage: s.lineage.map((l) => ({ ...l, genes: { ...l.genes } })),
    events: [...s.events],
    history: s.history.map((h) => ({ ...h })),
  };
}
/** Channels are body-relative: forward, right, back, left. Rear half-plane is blind. */
export function sense(c: Creature, food: Uint16Array): number[] {
  const mouth = parts(c).find((p) => p.role === "mouth")!,
    front = STEP[c.direction]!,
    right = STEP[(c.direction + 1) % 4]!;
  const radius =
      c.genes.sense + (parts(c).some((p) => p.role === "sensor") ? 2 : 0),
    signals = [0, 0, 0, 0];
  for (let dy = -radius; dy <= radius; dy++)
    for (let dx = -radius; dx <= radius; dx++) {
      const distance = Math.abs(dx) + Math.abs(dy),
        x = mouth.x + dx,
        y = mouth.y + dy;
      const f = dx * front.x + dy * front.y,
        r = dx * right.x + dy * right.y;
      if (
        !distance ||
        distance > radius ||
        f < 0 ||
        x < 0 ||
        x >= W ||
        y < 0 ||
        y >= H
      )
        continue;
      const amount = Math.floor(food[y * W + x]! / distance);
      if (f > 0) signals[0]! += amount;
      if (r > 0) signals[1]! += amount;
      if (r < 0) signals[3]! += amount;
    }
  return signals;
}
export function intake(s: World, c: Creature): number {
  let eaten = 0;
  for (const mouth of parts(c).filter((p) => p.role === "mouth")) {
    let perMouth = 0;
    for (const p of [
      mouth,
      ...STEP.map((d) => ({ x: mouth.x + d.x, y: mouth.y + d.y })),
    ]) {
      if (p.x < 0 || p.x >= W || p.y < 0 || p.y >= H) continue;
      const site = p.y * W + p.x,
        n = Math.min(24 - perMouth, s.food[site]!, 600 - c.energy);
      s.food[site] = s.food[site]! - n;
      c.energy += n;
      perMouth += n;
      eaten += n;
      if (perMouth === 24) break;
    }
  }
  c.intake += eaten;
  return eaten;
}
/** Exactly one safe turn OR a forward move. Occupied excludes this creature. */
export function act(
  c: Creature,
  desired: number,
  occupied: ReadonlySet<number>,
): number {
  c.desiredDirection = desired;
  if (!parts(c).some((p) => p.role === "motor")) {
    c.action = "Juvenile — growing a motor";
    return 0;
  }
  const delta = (desired - c.direction + 4) % 4;
  const turn = (direction: number) => {
    if (c.energy < 1 || !canTurn(c, direction, occupied)) return false;
    c.direction = direction;
    c.energy--;
    c.turns++;
    c.action = "Turning";
    return true;
  };
  if (delta) {
    const preferred = (c.direction + (delta === 3 ? 3 : 1)) % 4;
    if (turn(preferred) || turn((c.direction + (delta === 3 ? 1 : 3)) % 4))
      return 1;
    c.action = "Turn blocked by a body or wall";
    return 0;
  }
  const movementCost = 2 + Math.max(0, c.size - 3),
    d = STEP[c.direction]!;
  if (
    c.energy >= movementCost &&
    fits({ ...c, x: c.x + d.x, y: c.y + d.y }, occupied)
  ) {
    c.x += d.x;
    c.y += d.y;
    c.energy -= movementCost;
    c.distance++;
    c.action = "Moving forward";
    return movementCost;
  }
  if (turn((c.direction + 1) % 4) || turn((c.direction + 3) % 4)) return 1;
  c.action = "Forward path and turns blocked";
  return 0;
}
function mutate(s: World, source: Genes) {
  const genes = { ...source };
  let mutation = "";
  if (draw(s) % 4 === 0) {
    const word = draw(s),
      key = (
        ["sense", "foodWeight", "inertia", "lifespan", "bodyPlan"] as const
      )[word % 5]!,
      sign = word & 8 ? 1 : -1;
    if (key === "bodyPlan") {
      const before = genes.bodyPlan;
      genes.bodyPlan = PLANS[(PLANS.indexOf(before) + sign + 3) % 3]!;
      mutation = `bodyPlan: ${before} → ${genes.bodyPlan}`;
    } else {
      const before = genes[key],
        range =
          key === "sense"
            ? [3, 8]
            : key === "foodWeight"
              ? [1, 6]
              : key === "inertia"
                ? [0, 6]
                : [240, 1000];
      genes[key] = Math.max(
        range[0]!,
        Math.min(range[1]!, before + sign * (key === "lifespan" ? 40 : 1)),
      );
      if (before !== genes[key]) mutation = `${key}: ${before} → ${genes[key]}`;
    }
  }
  return { genes, mutation };
}
export function step(old: World): World {
  if (old.tick >= END) throw Error("Experiment complete.");
  const s = copy(old);
  s.sunlight += placeFood(s, 3);
  s.creatures = [];
  const occupied = new Set(old.creatures.flatMap(body));
  let children = 0;
  for (const previous of old.creatures) {
    const c = {
      ...previous,
      genes: { ...previous.genes },
      scores: [...previous.scores],
      signals: [...previous.signals],
    };
    c.age++;
    for (const p of body(c)) occupied.delete(p);
    c.signals = sense(c, s.food);
    c.scores = c.signals.map(
      (n, i) => n * c.genes.foodWeight + (i === 0 ? c.genes.inertia : 0),
    );
    const relative = c.signals.some((n) => n > 0)
      ? c.scores.indexOf(Math.max(...c.scores))
      : draw(s) % 4;
    s.dissipated += act(c, (c.direction + relative) % 4, occupied);
    const eaten = intake(s, c),
      metabolism = Math.min(c.energy, c.size);
    c.energy -= metabolism;
    s.dissipated += metabolism;
    if (eaten) c.action += " · eating food";
    const record = s.lineage.find((l) => l.id === c.id)!;
    record.intake = c.intake;
    record.distance = c.distance;
    record.turns = c.turns;
    if (c.energy === 0 || c.age >= c.genes.lifespan) {
      s.dissipated += c.energy + c.size * 8;
      record.died = s.tick + 1;
      record.deathReason = c.energy === 0 ? "starvation" : "age";
      event(s, `Organism ${c.id} died (${record.deathReason}).`);
      continue;
    }
    if (
      c.size < planSize(c.genes.bodyPlan) &&
      c.age >= (c.size === 2 ? 10 : 20) &&
      c.energy >= (c.size === 2 ? 80 : 100) &&
      fits({ ...c, size: c.size + 1 }, occupied)
    ) {
      c.energy -= 8;
      c.size++;
      c.action = "Developing an inherited body cell";
    }
    for (const p of body(c)) occupied.add(p);
    if (
      c.age >= 40 &&
      s.tick - c.lastBirth >= 80 &&
      c.energy >= 260 &&
      old.creatures.length + children < 48 &&
      s.lineage.length < 256
    ) {
      // Mutation is sampled only after finding a valid two-cell site; all plans share the juvenile footprint.
      let spot: { x: number; y: number } | undefined;
      for (let dy = -8; dy <= 8 && !spot; dy++)
        for (let dx = -8; dx <= 8; dx++) {
          if (Math.abs(dx) + Math.abs(dy) < 5) continue;
          const x = c.x + dx,
            y = c.y + dy;
          if (fits({ ...c, x, y, size: 2 }, occupied)) {
            spot = { x, y };
            break;
          }
        }
      if (spot) {
        const change = mutate(s, c.genes),
          id = s.lineage.length + 1;
        c.energy -= 116;
        c.lastBirth = s.tick;
        c.action = "Reproducing";
        const child: Creature = {
          ...c,
          ...spot,
          id,
          parent: c.id,
          generation: c.generation + 1,
          size: 2,
          energy: 100,
          age: 0,
          lastBirth: -80,
          genes: change.genes,
          action: "Juvenile — growing a motor",
          scores: [0, 0, 0, 0],
          signals: [0, 0, 0, 0],
          desiredDirection: c.direction,
          intake: 0,
          distance: 0,
          turns: 0,
        };
        for (const p of body(child)) occupied.add(p);
        s.creatures.push(child);
        children++;
        s.lineage.push({
          id,
          parent: c.id,
          family: record.family,
          generation: child.generation,
          born: s.tick + 1,
          died: null,
          mutated: Boolean(change.mutation),
          genes: { ...change.genes },
          mutation: change.mutation,
          intake: 0,
          distance: 0,
          turns: 0,
          deathReason: "",
        });
        event(
          s,
          `Organism ${c.id} produced ${id}${change.mutation ? ` (${change.mutation})` : ""}.`,
        );
      }
    }
    if (c.energy < 30) c.action += " · low energy";
    s.creatures.push(c);
  }
  s.creatures.sort((a, b) => a.id - b.id);
  s.tick++;
  if (s.tick % 20 === 0) s.history.push(sample(s));
  assertWorld(s);
  return s;
}
export function assertWorld(s: World) {
  const occupied = new Set<number>();
  let total = s.dissipated;
  for (const food of s.food) total += food;
  for (const c of s.creatures) {
    if (
      !Number.isInteger(c.energy) ||
      c.energy < 0 ||
      c.energy > 600 ||
      !Number.isInteger(c.direction) ||
      ![0, 1, 2, 3].includes(c.direction) ||
      !Number.isInteger(c.size) ||
      c.size < 2 ||
      c.size > planSize(c.genes.bodyPlan) ||
      !fits(c, occupied)
    )
      throw Error("Oriented body/energy invariant failed.");
    for (const p of body(c)) occupied.add(p);
    total += c.energy + c.size * 8;
  }
  if (
    total !== s.initial + s.sunlight ||
    s.creatures.length > 48 ||
    s.lineage.length > 256 ||
    s.history.length > 81
  )
    throw Error("Oriented ecology resource/history invariant failed.");
}
