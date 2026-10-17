import { nextRandom } from '../simulation/rng.ts';
export const W = 64, H = 48, END = 1600;
export interface EcologyDefinition { format: 'mathos-ecology'; version: 1; seed: number; mode: 'seeded' | 'primordial' }
export interface Genes { sense: number; foodWeight: number; inertia: number; lifespan: number }
export interface Creature { id: number; parent: number | null; generation: number; x: number; y: number; size: number; energy: number; age: number; lastBirth: number; direction: number; genes: Genes; action: string; scores: number[] }
export interface Ancestor { id: number; parent: number | null; generation: number; born: number; died: number | null; mutated: boolean }
export interface Ecology { definition: EcologyDefinition; tick: number; rng: number; food: Uint16Array; creatures: Creature[]; lineage: Ancestor[]; initial: number; sunlight: number; dissipated: number; events: string[] }
export function validateEcology(v: unknown): EcologyDefinition {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw Error('Expected an ecology definition.');
  const d = v as Record<string, unknown>;
  if (Object.keys(d).length !== 4 || !['format','version','seed','mode'].every(k => Object.hasOwn(d,k)) || d.format !== 'mathos-ecology' || d.version !== 1 || !Number.isInteger(d.seed) || (d.seed as number) < 0 || (d.seed as number) > 4294967295 || (d.mode !== 'seeded' && d.mode !== 'primordial')) throw Error('Unsupported ecology definition. Use version 1, a uint32 seed and seeded/primordial mode.');
  return Object.freeze({ format: 'mathos-ecology', version: 1, seed: d.seed as number, mode: d.mode });
}
export function parseEcology(text: string) { if(new TextEncoder().encode(text).byteLength>65536)throw Error('Definition exceeds 64 KiB.'); let v: unknown; try{v=JSON.parse(text);}catch{throw Error('Invalid ecology JSON.');}return validateEcology(v); }
export function body(c: Creature): number[] { return Array.from({length:c.size},(_,i)=>c.y*W+c.x+i); }
function draw(s: Ecology) { const r = nextRandom(s.rng); s.rng=r.state; return r.value; }
function event(s: Ecology, text: string) { s.events.unshift(`Step ${s.tick+1}: ${text}`); s.events.length=Math.min(40,s.events.length); }
function placeFood(s: Ecology, attempts: number) { let input=0;const occupied=new Set(s.creatures.flatMap(body));for(let i=0;i<attempts;i++){const p=draw(s)%(W*H);if(s.food[p]===0&&!occupied.has(p)){s.food[p]=24;input+=24;}}return input; }
export function ecologyMetrics(s: Ecology) {
  let foodEnergy=0, pellets=0;for(const n of s.food){foodEnergy+=n;if(n)pellets++;}
  const stores=s.creatures.reduce((n,c)=>n+c.energy,0), structure=s.creatures.reduce((n,c)=>n+c.size*8,0);
  return { population:s.creatures.length, pellets, births:s.lineage.length-(s.definition.mode==='seeded'?8:0), deaths:s.lineage.filter(l=>l.died!==null).length, generation:Math.max(0,...s.lineage.map(l=>l.generation)), foodEnergy, stores, structure, dissipated:s.dissipated, supplied:s.initial+s.sunlight, accounted:foodEnergy+stores+structure+s.dissipated };
}
export function initializeEcology(input: EcologyDefinition): Ecology {
  const definition=validateEcology(input);const s:Ecology={definition,tick:0,rng:definition.seed,food:new Uint16Array(W*H),creatures:[],lineage:[],initial:0,sunlight:0,dissipated:0,events:[]};
  s.initial=placeFood(s,360);
  if(definition.mode==='seeded') for(let i=0;i<8;i++) {
    const id=i+1;s.creatures.push({id,parent:null,generation:0,x:8+(i%4)*14,y:12+Math.floor(i/4)*23,size:3,energy:120,age:0,lastBirth:-80,direction:i%4,genes:{sense:6,foodWeight:3,inertia:2,lifespan:600},action:'Ready to explore',scores:[0,0,0,0]});
    s.lineage.push({id,parent:null,generation:0,born:0,died:null,mutated:false});s.initial+=144;
  }
  s.events=['World prepared. Food is green; the colored three-cell bodies are organisms.'];assertEcology(s);return s;
}
function fits(c: Creature, occupied:Set<number>) { return c.x>=0&&c.x+c.size<=W&&c.y>=0&&c.y<H&&body(c).every(p=>!occupied.has(p)); }
export function senseFood(c: Creature, food: Uint16Array): number[] {
  const signals=[0,0,0,0],r=c.genes.sense;
  for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    const distance=Math.abs(dx)+Math.abs(dy),x=c.x+dx,y=c.y+dy;
    if(!distance||distance>r||x<0||x>=W||y<0||y>=H)continue;
    const amount=Math.floor(food[y*W+x]!/distance);
    if(dy<0)signals[0]!+=amount;if(dx>0)signals[1]!+=amount;if(dy>0)signals[2]!+=amount;if(dx<0)signals[3]!+=amount;
  }
  return signals;
}
function feed(s: Ecology,c: Creature): number {
  const mouth=c.y*W+c.x+1;let eaten=0;
  for(const p of [mouth,...(c.y>0?[mouth-W]:[]),...(c.x+2<W?[mouth+1]:[]),...(c.y+1<H?[mouth+W]:[]),mouth-1]){
    const n=Math.min(24-eaten,s.food[p]!,600-c.energy);s.food[p]=s.food[p]!-n;c.energy+=n;eaten+=n;if(eaten===24)break;
  }return eaten;
}
export function copyEcology(s: Ecology): Ecology { return {...s,food:s.food.slice(),creatures:s.creatures.map(c=>({...c,genes:{...c.genes},scores:[...c.scores]})),lineage:s.lineage.map(l=>({...l})),events:[...s.events]}; }
export function stepEcology(old: Ecology): Ecology {
  if(old.tick>=END)throw Error('Experiment complete.');
  const s=copyEcology(old);s.sunlight+=placeFood(s,3);s.creatures=[];const occupied=new Set(old.creatures.flatMap(body));let children=0;
  for(const previous of old.creatures){
    const c={...previous,genes:{...previous.genes},scores:[...previous.scores]};c.age++;
    const eaten=feed(s,c),cost=Math.min(c.energy,1);c.energy-=cost;s.dissipated+=cost;
    if(c.energy===0||c.age>=c.genes.lifespan){s.dissipated+=c.energy+c.size*8;for(const p of body(c))occupied.delete(p);s.lineage.find(l=>l.id===c.id)!.died=s.tick+1;event(s,`Organism ${c.id} died (${c.energy===0?'starvation':'age'}).`);continue;}
    const signals=senseFood(c,s.food);c.scores=signals.map((n,i)=>n*c.genes.foodWeight+(i===c.direction?c.genes.inertia:0));
    let direction=signals.some(n=>n>0)?c.scores.indexOf(Math.max(...c.scores)):draw(s)%4;
    c.action=eaten?'Eating food':'Searching for food';
    if(c.size>=3&&c.energy>=2){
      for(const p of body(c))occupied.delete(p);let moved=false;
      for(let attempt=0;attempt<4;attempt++) { const d=(direction+attempt)%4,nx=c.x+[0,1,0,-1][d]!,ny=c.y+[-1,0,1,0][d]!;
        if(fits({...c,x:nx,y:ny},occupied)){c.x=nx;c.y=ny;direction=d;c.energy-=2;s.dissipated+=2;moved=true;break;}}
      c.direction=direction;for(const p of body(c))occupied.add(p);if(!moved)c.action='Blocked by a body or wall';
    }
    if(c.energy<30)c.action='Low energy — searching';
    if(c.size===2&&c.energy>=80&&c.age>=10&&fits({...c,size:3},new Set([...occupied].filter(p=>!body(c).includes(p))))){c.energy-=8;c.size=3;occupied.add(c.y*W+c.x+2);c.action='Growing a motor cell';}
    if(c.age>=40&&s.tick-c.lastBirth>=80&&c.energy>=260&&old.creatures.length+children<48&&s.lineage.length<256){
      let spot: {x:number;y:number}|undefined;
      for(let dy=-8;dy<=8&&!spot;dy++)for(let dx=-8;dx<=8;dx++){if(Math.abs(dx)+Math.abs(dy)<5)continue;const x=c.x+dx,y=c.y+dy;if(fits({...c,x,y,size:2},occupied)){spot={x,y};break;}}
      if(spot){const genes={...c.genes};let mutated=false;if(draw(s)%4===0){const word=draw(s),key=(['sense','foodWeight','inertia','lifespan'] as const)[word%4]!,before=genes[key],step=key==='lifespan'?40:1;const range=key==='sense'?[3,8]:key==='foodWeight'?[1,6]:key==='inertia'?[0,6]:[240,1000];genes[key]=Math.max(range[0]!,Math.min(range[1]!,before+((word&4)?step:-step)));mutated=before!==genes[key];}
        c.energy-=116;c.lastBirth=s.tick;c.action='Reproducing';const id=s.lineage.length+1;
        const child:Creature={...c,...spot,id,parent:c.id,generation:c.generation+1,size:2,energy:100,age:0,lastBirth:-80,genes,action:'Juvenile — growing a motor',scores:[0,0,0,0]};
        for(const p of body(child))occupied.add(p);s.creatures.push(child);s.lineage.push({id,parent:c.id,generation:child.generation,born:s.tick+1,died:null,mutated});children++;event(s,`Organism ${c.id} produced ${id}${mutated?' with a genetic change':''}.`);
      }
    }
    s.creatures.push(c);
  }
  s.creatures.sort((a,b)=>a.id-b.id);s.tick++;assertEcology(s);return s;
}
export function assertEcology(s: Ecology) {
  const m=ecologyMetrics(s),occupied=new Set<number>();
  if(m.supplied!==m.accounted||s.creatures.length>48||s.lineage.length>256)throw Error('Ecology resource/population invariant failed.');
  for(const c of s.creatures){if(!Number.isInteger(c.energy)||c.energy<0||c.energy>600||!fits(c,occupied)||![2,3].includes(c.size))throw Error('Ecology body/energy invariant failed.');for(const p of body(c))occupied.add(p);}
}
