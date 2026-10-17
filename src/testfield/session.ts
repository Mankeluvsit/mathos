import {validateConfig, needsRestart, type Configuration} from './config.ts';
import {initialize, copy, step, assertWorld, founder, archive, sample, type World} from './engine.ts';
import {parts, fits, canTurn, founderLayout, layoutKey} from '../ecology/body-genome.ts';
import {PLANS, type BodyPlan} from '../ecology/oriented-geometry.ts';

export type Edit = {tick:number;kind:'config';config:Configuration} |
  {tick:number;kind:'food'|'erase';x:number;y:number} |
  {tick:number;kind:'add';x:number;y:number;direction:number;bodyPlan:BodyPlan} |
  {tick:number;kind:'rotate';id:number;turn:'left'|'right'} | {tick:number;kind:'clear'};
function integer(n:unknown,min:number,max:number):number {
  if(!Number.isInteger(n)||(n as number)<min||(n as number)>max)throw Error('Edit contains an out-of-range whole number.');
  return n as number;
}
export function validateEdit(value:unknown,c:Configuration):Edit {
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid edit.');
  const e=value as Record<string,unknown>,tick=integer(e.tick,0,1600);
  const keys = e.kind==='config'?['tick','kind','config']:e.kind==='clear'?['tick','kind']:e.kind==='rotate'?['tick','kind','id','turn']:
    e.kind==='add'?['tick','kind','x','y','direction','bodyPlan']:['tick','kind','x','y'];
  if(Object.keys(e).length!==keys.length||keys.some(k=>!Object.hasOwn(e,k)))throw Error('Unexpected edit fields.');
  if(e.kind==='config')return {tick,kind:'config',config:validateConfig(e.config)};
  if(e.kind==='clear')return {tick,kind:'clear'};
  if(e.kind==='rotate') {
    if(e.turn!=='left'&&e.turn!=='right')throw Error('Invalid rotation.');
    return {tick,kind:'rotate',id:integer(e.id,1,256),turn:e.turn};
  }
  const x=integer(e.x,0,c.world.width-1),y=integer(e.y,0,c.world.height-1);
  if(e.kind==='food'||e.kind==='erase')return {tick,kind:e.kind,x,y};
  if(e.kind==='add'&&PLANS.includes(e.bodyPlan as BodyPlan))return {tick,kind:'add',x,y,direction:integer(e.direction,0,3),bodyPlan:e.bodyPlan as BodyPlan};
  throw Error('Unsupported edit.');
}
export function applyEdit(old:World,input:unknown):{world:World;edit:Edit} {
  const e=validateEdit(input,old.definition);
  if(e.tick!==old.tick)throw Error('Edit tick does not match the active boundary.');
  const s=copy(old),{width,height}=s.definition.world;
  const occupied=(except=-1)=>new Set(s.creatures.filter(c=>c.id!==except).flatMap(c=>parts(c).map(p=>p.y*width+p.x)));
  const remove=(id:number)=>{
    const c=s.creatures.find(c=>c.id===id)!;s.externalOut+=c.energy+c.size*8;
    s.creatures=s.creatures.filter(c=>c.id!==id);const a=s.lineage.find(l=>l.id===id)!;
    a.died=s.tick;a.deathReason='removed by user';a.developed=c.size;
  };
  if(e.kind==='config') {
    if(needsRestart(s.definition,e.config))throw Error('Seed, dimensions or scenario changed. Use Prepare test to reset explicitly.');
    if(e.config.test.steps<s.tick)throw Error('The test limit cannot precede the current step. Reset to start a shorter test.');
    s.definition=e.config;
  } else if(e.kind==='food') {
    const site=e.y*width+e.x,amount=Math.max(0,s.definition.rules.foodEnergy-s.food[site]!);
    s.food[site]=s.food[site]!+amount;s.externalIn+=amount;
  } else if(e.kind==='add') {
    if(s.creatures.length>=48||s.lineage.length>=256)throw Error('Organism/archive limit reached.');
    const c=founder(s.lineage.length+1,s.definition.seed);
    c.x=e.x;c.y=e.y;c.direction=e.direction;c.desiredDirection=e.direction;c.genes.bodyPlan=e.bodyPlan;
    c.genes.layout=founderLayout(e.bodyPlan);c.size=c.genes.layout.length;c.energy=s.definition.organisms.startingEnergy;
    if(!fits(c,occupied(),width,height))throw Error('The whole body must fit without overlapping another organism.');
    s.creatures.push(c);s.creatures.sort((a,b)=>a.id-b.id);const a=archive(c);a.born=s.tick;s.lineage.push(a);
    s.externalIn+=c.energy+c.size*8;
  } else if(e.kind==='rotate') {
    const c=s.creatures.find(c=>c.id===e.id);
    if(!c)throw Error('Select a living organism to rotate.');
    const direction=(c.direction+(e.turn==='right'?1:3))%4;
    if(!canTurn(c,direction,occupied(c.id),width,height))throw Error('Rotation is blocked by a body or edge.');
    c.direction=direction;c.desiredDirection=direction;c.action='Rotated by user';
  } else if(e.kind==='erase') {
    const c=s.creatures.find(c=>parts(c).some(p=>p.x===e.x&&p.y===e.y));if(c)remove(c.id);
    const site=e.y*width+e.x;s.externalOut+=s.food[site]!;s.food[site]=0;
  } else {
    for(const c of [...s.creatures])remove(c.id);
    s.externalOut+=s.food.reduce((a,b)=>a+b,0);s.food.fill(0);
  }
  if(s.history.at(-1)?.tick===s.tick)s.history[s.history.length-1]=sample(s);
  assertWorld(s);return {world:s,edit:e};
}
export function metrics(s:World) {
  const food=s.food.reduce((a,b)=>a+b,0),stores=s.creatures.reduce((n,c)=>n+c.energy,0),structure=s.creatures.reduce((n,c)=>n+c.size*8,0);
  const supplied=s.initial+s.sunlight+s.externalIn,accounted=food+stores+structure+s.dissipated+s.externalOut;
  return {population:s.creatures.length,births:s.lineage.filter(l=>l.parent!==null).length,
    introduced:s.lineage.filter(l=>l.parent===null).length,removed:s.lineage.filter(l=>l.deathReason==='removed by user').length,
    deaths:s.lineage.filter(l=>l.died!==null&&l.deathReason!=='removed by user').length,
    intake:s.lineage.reduce((n,l)=>n+l.intake,0),moves:s.lineage.reduce((n,l)=>n+l.distance,0),turns:s.lineage.reduce((n,l)=>n+l.turns,0),
    updates:s.lineage.reduce((n,l)=>n+l.updates,0),acceptedChanges:s.lineage.filter(l=>l.layoutMutation).length,
    enabledProposals:s.lineage.filter(l=>l.layoutAttempt&&!l.layoutAttempt.includes('disabled')).length,
    maxDeveloped:Math.max(0,...s.lineage.map(l=>l.developed)),distinctGenomes:new Set(s.lineage.map(l=>layoutKey(l.genes.layout))).size,
    initial:s.initial,sunlight:s.sunlight,externalIn:s.externalIn,externalOut:s.externalOut,food,stores,structure,dissipated:s.dissipated,supplied,accounted,exact:supplied===accounted};
}
export class TestSession {
  readonly initial:Configuration;
  private world:World;
  private edits:Edit[]=[];
  private undoBefore:World|null=null;
  private errors:string[]=[];
  undoCount=0;
  failure='';
  constructor(input:unknown){this.initial=validateConfig(input);this.world=initialize(this.initial);}
  snapshot(){return copy(this.world);}
  get tick(){return this.world.tick;}
  get editCount(){return this.edits.length;}
  get canUndo(){return this.undoBefore!==null;}
  get complete(){return this.world.tick>=this.world.definition.test.steps;}
  recordError(message:string){this.errors.push(message.slice(0,2000));this.errors=this.errors.slice(-10);}
  edit(input:unknown){
    try {
      if(this.edits.length>=256)throw Error('256-edit limit reached. Prepare a new test or save this report.');
      const next=applyEdit(this.world,input);this.undoBefore=this.world;this.world=next.world;this.edits.push(next.edit);
    }catch(e){this.recordError(e instanceof Error?e.message:'Edit failed.');throw e;}
  }
  undo(){if(!this.undoBefore)throw Error('Undo is available only before the next step.');this.world=this.undoBefore;this.undoBefore=null;this.edits.pop();this.undoCount++;}
  advance(){
    if(this.complete||this.failure)return;
    try {this.world=step(this.world);this.undoBefore=null;}
    catch(e){this.failure=e instanceof Error?e.message:'Engine failed.';this.recordError(this.failure);throw e;}
  }
  recipe(){return {initial:this.initial,edits:structuredClone(this.edits),tick:this.world.tick,undoCount:this.undoCount,errors:[...this.errors],failure:this.failure};}
}
export function replay(initial:unknown,edits:unknown,tick:number):World {
  integer(tick,0,1600);if(!Array.isArray(edits)||edits.length>256)throw Error('Invalid replay edit budget.');
  let s=initialize(validateConfig(initial)),i=0;
  while(true){
    while(i<edits.length&&(edits[i] as Record<string,unknown>)?.tick===s.tick){s=applyEdit(s,edits[i]).world;i++;}
    if(s.tick===tick)break;
    s=step(s);
  }
  if(i!==edits.length)throw Error('Replay edits are out of order or beyond the reported tick.');
  return s;
}
export function canonicalState(s:World):string {
  return JSON.stringify(s,(_key,value)=>value instanceof Uint16Array?Array.from(value):
    value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(key=>[key,value[key]])):value);
}
