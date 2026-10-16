import { validateLifeRun, type LifeRun } from '../domain/life-run.ts';
import { nextRandom } from '../simulation/rng.ts';
import { transport } from '../simulation/transport.ts';

export const LIFE_MAX_TICKS = 2000;
export interface Genome { maxCells: number; bias: number; resourceWeight: number; energyWeight: number }
export interface Organism { id: number; cells: number[]; energy: number; genome: Genome; score: number }
export interface Lineage { id: number; parent: number | null; born: number; died: number | null; mutated: boolean }
export interface LifeState {
  definition: LifeRun; tick: number; rngState: number; field: Uint16Array;
  organisms: Organism[]; lineage: Lineage[]; dissipated: number; initialTotal: number;
}
export function lifeMetrics(s: LifeState) {
  let field = 0; for (const n of s.field) field += n;
  const stored = s.organisms.reduce((n, o) => n + o.energy, 0);
  const cells = s.organisms.reduce((n, o) => n + o.cells.length, 0);
  return { tick: s.tick, population: s.organisms.length, cells, births: s.lineage.length,
    deaths: s.lineage.filter(l => l.died !== null).length, mutations: s.lineage.filter(l => l.mutated).length,
    field, stored, structure: cells * 32, dissipated: s.dissipated, accounted: field + stored + cells * 32 + s.dissipated };
}
export function initializeLife(input: LifeRun): LifeState {
  const definition = validateLifeRun(input), { width, height } = definition.universe;
  const field = new Uint16Array(width * height); let rngState = definition.seed;
  for (let i = 0; i < field.length; i++) { const r = nextRandom(rngState); rngState = r.state; field[i] = 1024 + (r.value >>> 22); }
  const s: LifeState = { definition, tick: 0, rngState, field, organisms: [], lineage: [], dissipated: 0, initialTotal: 0 };
  s.initialTotal = lifeMetrics(s).field;
  if (definition.genesis.mode === 'seeded') {
    const site = Math.floor(height / 2) * width + Math.floor(width / 2);
    field[site] = field[site]! - 288;
    s.organisms.push({ id: 1, cells: [site], energy: 256, score: 0, genome: { maxCells: 4, bias: -2, resourceWeight: 1, energyWeight: 1 } });
    s.lineage.push({ id: 1, parent: null, born: 0, died: null, mutated: false });
  }
  assertLife(s); return s;
}
export function neighbors(site: number, d: LifeRun): number[] {
  const { width: w, height: h } = d.universe, x = site % w, y = Math.floor(site / w);
  const candidates = [[x, y - 1], [x + 1, y], [x, y + 1], [x - 1, y]];
  return candidates.filter(([a, b]) => d.rules.boundary === 'periodic' || (a! >= 0 && a! < w && b! >= 0 && b! < h))
    .map(([a, b]) => ((b! + h) % h) * w + ((a! + w) % w));
}
function candidate(o: Organism, s: LifeState, occupied: Set<number>): number | undefined {
  let best: number | undefined;
  for (const cell of o.cells) for (const n of neighbors(cell, s.definition)) {
    if (!occupied.has(n) && (best === undefined || s.field[n]! > s.field[best]!)) best = n;
  }
  return best;
}
function mutate(s: LifeState, parent: Genome): { genome: Genome; mutated: boolean } {
  const genome = { ...parent }; let r = nextRandom(s.rngState); s.rngState = r.state;
  if ((r.value & 3) !== 0) return { genome, mutated: false };
  r = nextRandom(s.rngState); s.rngState = r.state;
  const key = (['maxCells', 'bias', 'resourceWeight', 'energyWeight'] as const)[r.value % 4]!;
  const before = genome[key]; genome[key] = Math.max(key === 'maxCells' ? 2 : -8, Math.min(8, before + ((r.value & 4) ? 1 : -1)));
  return { genome, mutated: genome[key] !== before };
}
export function stepLife(old: LifeState): LifeState {
  if (old.tick >= LIFE_MAX_TICKS) throw Error('Life tick limit reached.');
  const s: LifeState = { ...old, field: transport(old.field, old.definition.universe.width, old.definition.universe.height, { ...old.definition.rules, id: 'conservative-transport', version: 1 }),
    organisms: [], lineage: old.lineage.map(l => ({ ...l })) };
  const occupied = new Set(old.organisms.flatMap(o => o.cells));
  for (const previous of old.organisms) {
    const o: Organism = { ...previous, cells: [...previous.cells], genome: { ...previous.genome } };
    for (const site of o.cells) { const intake = Math.min(32, s.field[site]!, 8192 - o.energy); s.field[site] = s.field[site]! - intake; o.energy += intake; }
    const cost = Math.min(o.energy, o.cells.length * 2); o.energy -= cost; s.dissipated += cost;
    if (o.energy === 0) {
      let release = o.cells.length * 32;
      for (const site of o.cells) { occupied.delete(site); const deposit = Math.min(release, 65535 - s.field[site]!); s.field[site] = s.field[site]! + deposit; release -= deposit; }
      s.dissipated += release;
      s.lineage.find(l => l.id === o.id)!.died = old.tick + 1; continue;
    }
    let site = candidate(o, s, occupied);
    o.score = o.genome.bias + o.genome.resourceWeight * Math.floor((site === undefined ? 0 : s.field[site]!) / 256) + o.genome.energyWeight * Math.floor(o.energy / 32);
    if (site !== undefined && o.score >= 0 && o.energy >= 32 && o.cells.length < o.genome.maxCells) {
      o.energy -= 32; o.cells.push(site); occupied.add(site);
    }
    s.organisms.push(o); site = candidate(o, s, occupied);
    // Include not-yet-processed organisms in the population bound; deaths free slots on the next tick.
    if (site !== undefined && o.energy >= 512 && o.cells.length >= 2
      && old.organisms.length + s.organisms.filter(n => n.id > old.lineage.length).length < 64 && s.lineage.length < 512) {
      o.energy -= 288; const id = s.lineage.length + 1, mutation = mutate(s, o.genome);
      s.organisms.push({ id, cells: [site], energy: 256, genome: mutation.genome, score: 0 }); occupied.add(site);
      s.lineage.push({ id, parent: o.id, born: old.tick + 1, died: null, mutated: mutation.mutated });
    }
  }
  s.organisms.sort((a, b) => a.id - b.id); s.tick++;
  assertLife(s); return s;
}
export function assertLife(s: LifeState) {
  const m = lifeMetrics(s), occupied = new Set<number>();
  if (m.accounted !== s.initialTotal || s.organisms.length > 64 || s.lineage.length > 512) throw Error('Life accounting or population invariant failed.');
  for (const o of s.organisms) {
    if (!Number.isInteger(o.energy) || o.energy < 0 || o.energy > 8192 || o.cells.length < 1 || o.cells.length > o.genome.maxCells) throw Error('Organism bounds invariant failed.');
    const reached = new Set([o.cells[0]!]);
    for (let i = 0; i < o.cells.length; i++) for (const cell of o.cells) if (reached.has(cell)) for (const n of neighbors(cell, s.definition)) if (o.cells.includes(n)) reached.add(n);
    if (reached.size !== o.cells.length) throw Error('Organism disconnected.');
    for (const site of o.cells) { if (site < 0 || site >= s.field.length || occupied.has(site)) throw Error('Illegal organism placement.'); occupied.add(site); }
  }
}
export function copyLife(s: LifeState): LifeState {
  return { ...s, field: s.field.slice(), organisms: s.organisms.map(o => ({ ...o, cells: [...o.cells], genome: { ...o.genome } })), lineage: s.lineage.map(l => ({ ...l })) };
}
