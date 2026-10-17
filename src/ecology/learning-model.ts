/** ecology-reference@3. V2 mechanics retained; learning lifecycle follows ADR0010. */
import { actionValues, chooseAction, createController, deriveStreams, learn, measuredReward, observe, type Controller } from './learning-controller.ts';
import { act, sense } from './oriented-model.ts';
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
  version: 3;
  learning: boolean;
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
  controller: Controller;
  explorationRng: number;
  lastDecision: Decision | null;
}
export interface Ancestor extends OldAncestor {
  family: number;
  genes: Genes;
  mutation: string;
  intake: number;
  distance: number;
  turns: number;
  deathReason: string;
  updates: number;
  lastDecision: Decision | null;
}
export interface Decision {
  tick: number;
  input: number[];
  nextInput: number[] | null;
  signals: number[];
  relative: number;
  headingBefore: number;
  actual: string;
  exploring: boolean;
  intake: number;
  mechanicalCost: number;
  upkeep: number;
  reward: number;
  delta: number;
  previousQ: number;
  nextQ: number;
  changes: number[];
  terminal: boolean;
}
function copyDecision(d: Decision | null): Decision | null {
  return d ? { ...d, input: [...d.input], nextInput: d.nextInput && [...d.nextInput], signals: [...d.signals], changes: [...d.changes] } : null;
}
function copyCreature(c: Creature): Creature {
  return { ...c, genes: {...c.genes}, scores: [...c.scores], signals: [...c.signals],
    controller: { updates: c.controller.updates, weights: c.controller.weights.map(row => [...row]) }, lastDecision: copyDecision(c.lastDecision) };
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
  reproductionRng: number;
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
    Object.keys(d).length !== 5 ||
    !["format", "version", "seed", "mode", "learning"].every((k) => Object.hasOwn(d, k)) ||
    d.format !== "mathos-ecology" ||
    d.version !== 3 ||
    typeof d.learning !== "boolean" ||
    !Number.isInteger(d.seed) ||
    (d.seed as number) < 0 ||
    (d.seed as number) > 4294967295 ||
    (d.mode !== "seeded" && d.mode !== "primordial")
  )
    throw Error(
      "Unsupported ecology definition. Expected version 3, uint32 seed, seeded/primordial mode and boolean learning.",
    );
  return Object.freeze({
    format: "mathos-ecology",
    version: 3,
    learning: d.learning as boolean,
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
function founder(id: number, seed: number): Creature {
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
    controller: createController(3, 2),
    explorationRng: deriveStreams(seed, id).exploration,
    lastDecision: null,
  };
}
export function initialize(input: Definition): World {
  const definition = validate(input);
  const s: World = {
    definition,
    tick: 0,
    rng: definition.seed,
    reproductionRng: deriveStreams(definition.seed, 1).reproduction,
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
      const c = founder(id, definition.seed);
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
        updates: 0,
        lastDecision: null,
      });
    }
  s.events = [
    `World prepared: ${definition.learning ? "learning on" : "learning off (frozen weights)"}. Bodies turn before moving forward.`,
  ];
  s.history.push(sample(s));
  assertWorld(s);
  return s;
}
export function copy(s: World): World {
  return {
    ...s,
    food: s.food.slice(),
    creatures: s.creatures.map(copyCreature),
    lineage: s.lineage.map((l) => ({ ...l, genes: { ...l.genes }, lastDecision: copyDecision(l.lastDecision) })),
    events: [...s.events],
    history: s.history.map((h) => ({ ...h })),
  };
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
function mutationDraw(s: World) {
  const r = nextRandom(s.reproductionRng);
  s.reproductionRng = r.state;
  return r.value;
}
function mutate(s: World, source: Genes) {
  const genes = { ...source };
  let mutation = "";
  if (mutationDraw(s) % 4 === 0) {
    const word = mutationDraw(s),
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
    const c = copyCreature(previous);
    c.age++;
    for (const p of body(c)) occupied.delete(p);
    c.signals = sense(c, s.food);
    const eligible = parts(c).some(p => p.role === 'motor');
    const input = observe(c.signals, c.energy);
    const headingBefore = c.direction;
    const choice = eligible ? chooseAction(c.controller, input, c.explorationRng) : null;
    c.scores = choice?.scores ?? actionValues(c.controller, input);
    if (choice) c.explorationRng = choice.rngState;
    const mechanicalCost = act(c, (c.direction + (choice?.action ?? 0)) % 4, occupied);
    const actual = c.action;
    s.dissipated += mechanicalCost;
    const eaten = intake(s, c),
      metabolism = Math.min(c.energy, c.size);
    c.energy -= metabolism;
    s.dissipated += metabolism;
    if (eaten) c.action += " · eating food";
    const record = s.lineage.find((l) => l.id === c.id)!;
    record.intake = c.intake;
    record.distance = c.distance;
    record.turns = c.turns;
    const finishDecision = (terminal: boolean) => {
      if (!choice) return;
      const nextInput = terminal ? null : observe(sense(c, s.food), c.energy);
      const reward = measuredReward(eaten, mechanicalCost, metabolism);
      const result = learn(c.controller, { input, action: choice.action, reward, nextInput, enabled: s.definition.learning });
      c.controller = result.controller;
      c.lastDecision = { tick: s.tick + 1, input, nextInput, signals: [...c.signals],
        relative: choice.action, headingBefore, actual, exploring: choice.exploring,
        intake: eaten, mechanicalCost, upkeep: metabolism, reward, delta: result.delta,
        previousQ: result.previousQ, nextQ: result.nextQ, changes: result.changes, terminal };
      record.updates = c.controller.updates;
      record.lastDecision = copyDecision(c.lastDecision);
    };
    if (c.energy === 0 || c.age >= c.genes.lifespan) {
      finishDecision(true);
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
          controller: createController(change.genes.foodWeight, change.genes.inertia),
          explorationRng: deriveStreams(s.definition.seed, id).exploration,
          lastDecision: null,
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
        updates: 0,
        lastDecision: null,
        });
        event(
          s,
          `Organism ${c.id} produced ${id}${change.mutation ? ` (${change.mutation})` : ""}.`,
        );
      }
    }
    finishDecision(s.tick + 1 === END);
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
    actionValues(c.controller, [64, 0, 0, 0, 0, 0]);
    if (c.controller.updates > s.tick || (!s.definition.learning && c.controller.updates !== 0)) throw Error('Learning budget invariant failed.');
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
