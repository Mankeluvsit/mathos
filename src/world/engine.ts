import {deriveStreams} from './streams.ts';
/** mathos-world@1: one canonical world for ordinary play and controlled tests. ADR0013. */
import { actionValues, chooseAction, createController, learn, observe, type Controller } from '../ecology/learning-controller.ts';
import { act, sense, resourceReward } from './mechanics.ts';
import { nextRandom } from "../simulation/rng.ts";
import {
  type Creature as OldCreature,
  type Genes as OldGenes,
  type Ancestor as OldAncestor,
} from "../ecology/model.ts";
import { parts, fits, founderLayout, cloneLayout, validateLayout, mutationProposal, type Layout } from '../ecology/body-genome.ts';
import { PLANS, STEP, type BodyPlan } from '../ecology/oriented-geometry.ts';
export { parts };
import { validateConfig, type Configuration } from './config.ts';
export type Definition = Configuration;
export interface Genes extends OldGenes {
  bodyPlan: BodyPlan;
  layout: Layout;
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
  inheritance:{body:boolean;traits:boolean;weights:boolean}|null;
  family: number;
  genes: Genes;
  mutation: string;
  intake: number;
  distance: number;
  turns: number;
  deathReason: string;
  developed: number;
  layoutAttempt: string;
  layoutMutation: string;
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
  return { ...c, genes: {...c.genes, layout: cloneLayout(c.genes.layout)}, scores: [...c.scores], signals: [...c.signals],
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
export interface Retired {records:number;births:number;introduced:number;removed:number;deaths:number;intake:number;moves:number;turns:number;updates:number;acceptedChanges:number;enabledProposals:number;maxDeveloped:number}
export function emptyRetired():Retired{return {records:0,births:0,introduced:0,removed:0,deaths:0,intake:0,moves:0,turns:0,updates:0,acceptedChanges:0,enabledProposals:0,maxDeveloped:0};}
export function trimArchive(s:World){
 while(s.lineage.length>256){const i=s.lineage.findIndex(l=>l.died!==null);if(i<0)throw Error('Archive safety invariant failed.');const l=s.lineage.splice(i,1)[0]!;s.retired.records++;s.retired.births+=Number(l.parent!==null);s.retired.introduced+=Number(l.parent===null);s.retired.removed+=Number(l.deathReason==='removed by user');s.retired.deaths+=Number(l.died!==null&&l.deathReason!=='removed by user');s.retired.intake+=l.intake;s.retired.moves+=l.distance;s.retired.turns+=l.turns;s.retired.updates+=l.updates;s.retired.acceptedChanges+=Number(Boolean(l.layoutMutation));s.retired.enabledProposals+=Number(Boolean(l.layoutAttempt)&&!l.layoutAttempt.includes('disabled'));s.retired.maxDeveloped=Math.max(s.retired.maxDeveloped,l.developed);}
}
export function foodEnergy(s:World){return s.food.reduce((a,b)=>a+b,0);}
export function foodAllowance(s:World,replenished:boolean){return Math.max(0,Math.min(s.definition.rules.foodEnergy,(s.definition.rules.foodCap??Number.MAX_SAFE_INTEGER)-foodEnergy(s),replenished?(s.definition.rules.supplyBudget??Number.MAX_SAFE_INTEGER)-s.sunlight:Number.MAX_SAFE_INTEGER));}
export interface World {
  definition: Definition;
  nextId:number;
  editsApplied:number;
  retired:Retired;
  tick: number;
  rng: number;
  reproductionRng: number;
  placementRng:number;
  food: Uint16Array;
  creatures: Creature[];
  lineage: Ancestor[];
  initial: number;
  sunlight: number;
  externalIn: number;
  externalOut: number;
  dissipated: number;
  events: string[];
  history: Sample[];
}
export const validate = validateConfig;
function draw(s: World) {
  const r = nextRandom(s.rng);
  s.rng = r.state;
  return r.value;
}
export function body(c: Creature, width: number) {
  return parts(c).map((p) => p.y * width + p.x);
}
function event(s: World, text: string) {
  s.events.unshift(`Step ${s.tick + 1}: ${text}`);
  s.events.length = Math.min(40, s.events.length);
}
function placeFood(s: World, attempts: number, replenished=false) {
  let supplied = 0;
  const {width: W,height: H}=s.definition.world;
  const occupied = new Set(s.creatures.flatMap(c=>body(c,W)));
  for (let i = 0; i < attempts; i++) {
    const p = draw(s) % (W * H);
    if (!s.food[p] && !occupied.has(p)) {
      const amount=Math.min(foodAllowance(s,false),replenished?Math.max(0,(s.definition.rules.supplyBudget??Number.MAX_SAFE_INTEGER)-s.sunlight-supplied):Number.MAX_SAFE_INTEGER);
      s.food[p] = amount;
      supplied += amount;
    }
  }
  return supplied;
}
function initialFood(s:World,target:number){
 const width=s.definition.world.width,occupied=new Set(s.creatures.flatMap(c=>body(c,width)));
 const sites=Array.from({length:s.food.length},(_,i)=>i).filter(i=>!occupied.has(i));let supplied=0;
 for(let i=0;i<Math.min(target,sites.length);i++){const j=i+draw(s)%(sites.length-i);[sites[i],sites[j]]=[sites[j]!,sites[i]!];const amount=foodAllowance(s,false);if(amount){s.food[sites[i]!]=amount;supplied+=amount;}}
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
export function founder(id: number, seed: number): Creature {
  return {
    id,
    parent: null,
    generation: 0,
    x: 8 + ((id - 1) % 4) * 14,
    y: 12 + Math.floor((id - 1) / 4) * 23,
    size: founderLayout(PLANS[(id - 1) % 3]!).length,
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
      layout: founderLayout(PLANS[(id - 1) % 3]!),
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
  const definition=validate(input), {width,height}=definition.world;
  const s:World={definition,tick:0,rng:definition.seed,reproductionRng:deriveStreams(definition.seed,1).reproduction,placementRng:deriveStreams(definition.seed,1).placement,
    nextId:1,editsApplied:0,retired:emptyRetired(),food:new Uint16Array(width*height),creatures:[],lineage:[],initial:0,sunlight:0,externalIn:0,externalOut:0,dissipated:0,events:[],history:[]};
  const count=definition.organisms.count;
  for(let i=0;i<count;i++) {
    const c=founder(i+1,definition.seed);
    c.x=count===1?Math.floor(width/2)-3:count>4?Math.floor(width*(0.2+0.2*(i%4))):Math.floor(width*(i%2?0.7:0.3));
    c.y=count<3?Math.floor(height/2):Math.floor(height*(i<(count>4?4:2)?0.3:0.7));
    c.direction=i%4;c.genes.bodyPlan=definition.organisms.bodyPlan;
    c.genes.layout=founderLayout(c.genes.bodyPlan);c.size=definition.test.preset==='growth'?2:c.genes.layout.length;
    c.energy=definition.organisms.startingEnergy;
    s.creatures.push(c);s.initial+=c.energy+c.size*8;
    s.lineage.push(archive(c));
  }
  s.nextId=count+1;
  {
    s.initial+=initialFood(s,definition.rules.initialFood);
    // Explicit food beside each front mouth makes these authored demonstrations inspectable.
    if(!['neutral','empty'].includes(definition.test.preset))for(const c of s.creatures)for(const p of parts(c).filter(p=>p.role==='mouth'))for(const d of [{x:0,y:0},...STEP]) {
      const x=p.x+d.x,y=p.y+d.y;
      if(x>=0&&x<width&&y>=0&&y<height&&!s.food[y*width+x]) {const amount=foodAllowance(s,false);s.food[y*width+x]=amount;s.initial+=amount;}
    }
  }
  s.events=['Prepared shared world.'];s.history=[sample(s)];assertWorld(s);return s;
}
export function archive(c:Creature):Ancestor {
  return {inheritance:null,id:c.id,parent:c.parent,family:c.id,generation:c.generation,born:0,died:null,mutated:false,
    genes:{...c.genes,layout:cloneLayout(c.genes.layout)},mutation:'',intake:0,distance:0,turns:0,deathReason:'',developed:c.size,
    layoutAttempt:'',layoutMutation:'',updates:0,lastDecision:null};
}
export function copy(s: World): World {
  return {
    ...s,
    retired:{...s.retired},
    food: s.food.slice(),
    creatures: s.creatures.map(copyCreature),
    lineage: s.lineage.map((l) => ({ ...l, inheritance:l.inheritance&&{...l.inheritance}, genes: { ...l.genes, layout: cloneLayout(l.genes.layout) }, lastDecision: copyDecision(l.lastDecision) })),
    events: [...s.events],
    history: s.history.map((h) => ({ ...h })),
  };
}
export function intake(s: World, c: Creature): number {
  const {width: W,height: H}=s.definition.world;
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
  const baseline=founder(1,s.definition.seed).genes;
  const genes = {...(s.definition.organisms.inheritTraits?source:baseline),bodyPlan:s.definition.organisms.inheritBody?source.bodyPlan:s.definition.organisms.bodyPlan,layout:cloneLayout(s.definition.organisms.inheritBody?source.layout:founderLayout(s.definition.organisms.bodyPlan))};
  let mutation='',layoutAttempt='',layoutMutation='';
  if(mutationDraw(s)%4===0){
    const word=mutationDraw(s),key=(['sense','foodWeight','inertia','lifespan','layout'] as const)[word%5]!,sign=word&8?1:-1;
    if(key==='layout') {
      if(s.definition.organisms.structuralMutation){const result=mutationProposal(genes.layout,word);genes.layout=result.layout;layoutAttempt=result.attempt;layoutMutation=result.mutation;mutation=result.mutation;}
      else layoutAttempt='structural mutations disabled';
    }else if(s.definition.organisms.traitMutation) {
      const before=genes[key],range=key==='sense'?[3,8]:key==='foodWeight'?[1,6]:key==='inertia'?[0,6]:[240,1000];
      genes[key]=Math.max(range[0]!,Math.min(range[1]!,before+sign*(key==='lifespan'?40:1)));
      if(before!==genes[key])mutation=`${key}: ${before} → ${genes[key]}`;
    }
  }
  return {genes,mutation,layoutAttempt,layoutMutation};
}
export function step(old: World): World {
  if(old.definition.test.steps!==null&&old.tick>=old.definition.test.steps)throw Error("Chosen stopping step reached.");
  if(!Number.isSafeInteger(old.tick+1))throw Error("Numeric safety pause; chosen run has not completed.");
  const s = copy(old);
  const {width: W,height: H}=s.definition.world;
  if(s.definition.rules.replenishment)s.sunlight += placeFood(s, s.definition.rules.spawnAttempts,true);
  s.creatures = [];
  const occupied = new Set(old.creatures.flatMap(c=>body(c,W)));
  let children = 0;
  const offset=old.creatures.length?old.tick%old.creatures.length:0;
  const turnOrder=[...old.creatures.slice(offset),...old.creatures.slice(0,offset)];
  for (const previous of turnOrder) {
    const c = copyCreature(previous);
    c.age++;
    for (const p of body(c,W)) occupied.delete(p);
    c.signals = sense(c, s.food, W, H);
    const eligible = parts(c).some(p => p.role === 'motor');
    const input = observe(c.signals, c.energy);
    const headingBefore = c.direction;
    const choice = eligible ? chooseAction(c.controller, input, c.explorationRng) : null;
    c.scores = choice?.scores ?? actionValues(c.controller, input);
    if (choice) c.explorationRng = choice.rngState;
    const mechanicalCost = act(c, (c.direction + (choice?.action ?? 0)) % 4, occupied, W, H);
    const actual = c.action;
    s.dissipated += mechanicalCost;
    const eaten = intake(s, c),
      metabolism = Math.min(c.energy, c.size*s.definition.rules.upkeep);
    c.energy -= metabolism;
    s.dissipated += metabolism;
    if (eaten) c.action += " · eating food";
    const record = s.lineage.find((l) => l.id === c.id)!;
    record.intake = c.intake;
    record.distance = c.distance;
    record.turns = c.turns;
    const finishDecision = (terminal: boolean) => {
      if (!choice) return;
      const nextInput = terminal ? null : observe(sense(c, s.food, W, H), c.energy);
      const reward = resourceReward(eaten, mechanicalCost, metabolism);
      const result = learn(c.controller, { input, action: choice.action, reward, nextInput, enabled: s.definition.organisms.learning });
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
      c.size < c.genes.layout.length &&
      c.age >= 10 * (c.size - 1) &&
      c.energy >= 80 + 20 * Math.max(0, c.size - 2) &&
      fits({ ...c, size: c.size + 1 }, occupied, W, H)
    ) {
      c.energy -= 8;
      c.size++;
      c.action = "Developing an inherited body cell";
    }
    record.developed = c.size;
    for (const p of body(c,W)) occupied.add(p);
    if (
      s.definition.organisms.reproduction &&
      c.size >= 3 &&
      c.age >= 40 &&
      s.tick - c.lastBirth >= 80 &&
      c.energy >= 260 &&
      old.creatures.length + children < 48
    ) {
      // Mutation is sampled only after finding a valid two-cell site; all plans share the juvenile footprint.
      let spot: {x:number;y:number}|undefined;
      const candidates:{x:number;y:number}[]=[];
      for(let dy=-8;dy<=8;dy++)for(let dx=-8;dx<=8;dx++)if(Math.abs(dx)+Math.abs(dy)>=5)candidates.push({x:c.x+dx,y:c.y+dy});
      for(let i=0;i<candidates.length;i++){
        const r=nextRandom(s.placementRng);s.placementRng=r.state;const j=i+r.value%(candidates.length-i);
        [candidates[i],candidates[j]]=[candidates[j]!,candidates[i]!];const candidate=candidates[i]!;
        if(fits({...c,...candidate,size:2},occupied,W,H)){spot=candidate;break;}
      }
      if (spot) {
        const change = mutate(s, c.genes),
          id = s.nextId++;
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
          controller:s.definition.organisms.inheritWeights?{updates:0,weights:c.controller.weights.map(row=>[...row])}:createController(change.genes.foodWeight, change.genes.inertia),
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
        for (const p of body(child,W)) occupied.add(p);
        s.creatures.push(child);
        children++;
        s.lineage.push({
          inheritance:{body:s.definition.organisms.inheritBody,traits:s.definition.organisms.inheritTraits,weights:s.definition.organisms.inheritWeights},
          id,
          parent: c.id,
          family: record.family,
          generation: child.generation,
          born: s.tick + 1,
          died: null,
          mutated: Boolean(change.mutation),
          genes: { ...change.genes, layout: cloneLayout(change.genes.layout) },
          mutation: change.mutation,
          intake: 0,
          distance: 0,
          turns: 0,
          deathReason: "",
        developed: 2,
        layoutAttempt: change.layoutAttempt,
        layoutMutation: change.layoutMutation,
        updates: 0,
        lastDecision: null,
        });
        event(
          s,
          `Organism ${c.id} produced ${id}${change.mutation ? ` (${change.mutation})` : ""}.`,
        );
      }
    }
    finishDecision(s.definition.test.steps!==null&&s.tick+1===s.definition.test.steps);
    if (c.energy < 30) c.action += " · low energy";
    s.creatures.push(c);
  }
  s.creatures.sort((a, b) => a.id - b.id);
  s.tick++;
  if (s.tick % 20 === 0) s.history.push(sample(s));
  s.history=s.history.slice(-81);trimArchive(s);
  assertWorld(s);
  return s;
}
export function assertWorld(s: World) {
  const {width: W,height: H}=s.definition.world;
  if(!Number.isSafeInteger(s.tick)||s.tick<0||!Number.isSafeInteger(s.nextId)||s.nextId<1||!Number.isSafeInteger(s.editsApplied)||s.editsApplied<0||Object.values(s.retired).some(n=>!Number.isSafeInteger(n)||n<0)||[s.initial,s.sunlight,s.externalIn,s.externalOut,s.dissipated].some(n=>!Number.isSafeInteger(n)||n<0))throw Error("Numeric/resource safety invariant failed.");
  if(new Set(s.creatures.map(c=>c.id)).size!==s.creatures.length||s.lineage.filter(l=>l.died===null).length!==s.creatures.length)throw Error("Living identity invariant failed.");
  if(s.food.length!==W*H||s.food.some(n=>n>96)||new Set(s.lineage.map(l=>l.id)).size!==s.lineage.length||s.lineage.some(l=>l.id>=s.nextId)||s.creatures.some(c=>!s.lineage.some(l=>l.id===c.id&&l.died===null)))throw Error("World archive/food invariant failed.");
  if(s.definition.rules.foodCap!==null&&foodEnergy(s)>s.definition.rules.foodCap)throw Error("Standing food cap exceeded.");
  if(s.definition.rules.supplyBudget!==null&&s.sunlight>s.definition.rules.supplyBudget)throw Error("Food supply budget exceeded.");
  const occupied = new Set<number>();
  let total = s.dissipated+s.externalOut;
  for (const food of s.food) total += food;
  const validGenes=(genes:Genes)=>{validateLayout(genes.layout);if(!['dart','grazer','scout'].includes(genes.bodyPlan)||!Number.isInteger(genes.sense)||genes.sense<3||genes.sense>8||!Number.isInteger(genes.foodWeight)||genes.foodWeight<1||genes.foodWeight>6||!Number.isInteger(genes.inertia)||genes.inertia<0||genes.inertia>6||!Number.isInteger(genes.lifespan)||genes.lifespan<240||genes.lifespan>1000)throw Error('Invalid inherited genes.');};
  if([s.rng,s.reproductionRng,s.placementRng].some(n=>!Number.isInteger(n)||n<0||n>0xffffffff))throw Error('Invalid world streams.');
  for(const l of s.lineage){validGenes(l.genes);if(l.parent===null?l.inheritance!==null:!l.inheritance||Object.keys(l.inheritance).length!==3||[l.inheritance.body,l.inheritance.traits,l.inheritance.weights].some(v=>typeof v!=='boolean'))throw Error('Invalid birth policy.');if(!Number.isSafeInteger(l.id)||l.id<1||!Number.isSafeInteger(l.born)||l.born<0||l.born>s.tick||(l.parent!==null&&(!Number.isSafeInteger(l.parent)||l.parent<1||l.parent>=l.id))||!Number.isSafeInteger(l.family)||l.family<1||l.family>l.id||[l.intake,l.distance,l.turns,l.updates].some(n=>!Number.isSafeInteger(n)||n<0)||(l.died!==null&&(!Number.isSafeInteger(l.died)||l.died<l.born||l.died>s.tick)))throw Error('Invalid lineage record.');}
  for (const c of s.creatures) {
    validGenes(c.genes);if(!Number.isSafeInteger(c.age)||c.age<0||c.age>1000||!Number.isSafeInteger(c.id)||c.id<1||!Number.isInteger(c.x)||!Number.isInteger(c.y))throw Error('Invalid living organism.');
    actionValues(c.controller, [64, 0, 0, 0, 0, 0]);
    if (c.controller.updates > s.tick) throw Error('Learning budget invariant failed.');
    if (
      !Number.isInteger(c.energy) ||
      c.energy < 0 ||
      c.energy > 600 ||
      !Number.isInteger(c.direction) ||
      ![0, 1, 2, 3].includes(c.direction) ||
      !Number.isInteger(c.size) ||
      c.size < 2 ||
      c.size > c.genes.layout.length ||
      !fits(c, occupied, W, H)
    )
      throw Error("Oriented body/energy invariant failed.");
    for (const p of body(c,W)) occupied.add(p);
    total += c.energy + c.size * 8;
  }
  for(const l of s.lineage)if(!Number.isInteger(l.developed)||l.developed<2||l.developed>l.genes.layout.length)throw Error("Recorded development invariant failed.");
  if (
    total !== s.initial + s.sunlight + s.externalIn ||
    s.creatures.length > 48 ||
    s.lineage.length > 256 ||
    s.history.length > 81
  )
    throw Error("Oriented ecology resource/history invariant failed.");
}
