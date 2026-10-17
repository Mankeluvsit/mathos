import {validateConfig, needsRestart, type Configuration} from './config.ts';
import {initialize, copy, step, assertWorld, founder, archive, sample, trimArchive, foodEnergy, emptyRetired, type World} from './engine.ts';
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
  const e=value as Record<string,unknown>,tick=integer(e.tick,0,Number.MAX_SAFE_INTEGER);
  const keys = e.kind==='config'?['tick','kind','config']:e.kind==='clear'?['tick','kind']:e.kind==='rotate'?['tick','kind','id','turn']:
    e.kind==='add'?['tick','kind','x','y','direction','bodyPlan']:['tick','kind','x','y'];
  if(Object.keys(e).length!==keys.length||keys.some(k=>!Object.hasOwn(e,k)))throw Error('Unexpected edit fields.');
  if(e.kind==='config')return {tick,kind:'config',config:validateConfig(e.config)};
  if(e.kind==='clear')return {tick,kind:'clear'};
  if(e.kind==='rotate') {
    if(e.turn!=='left'&&e.turn!=='right')throw Error('Invalid rotation.');
    return {tick,kind:'rotate',id:integer(e.id,1,Number.MAX_SAFE_INTEGER),turn:e.turn};
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
    if(e.config.test.steps!==null&&e.config.test.steps<s.tick)throw Error('The test limit cannot precede the current step. Reset to start a shorter test.');
    s.definition=e.config;
  } else if(e.kind==='food') {
    const site=e.y*width+e.x,amount=Math.max(0,s.definition.rules.foodEnergy-s.food[site]!);
    if(s.definition.rules.foodCap!==null&&foodEnergy(s)+amount>s.definition.rules.foodCap)throw Error("Food addition would exceed the standing energy cap.");
    s.food[site]=s.food[site]!+amount;s.externalIn+=amount;
  } else if(e.kind==='add') {
    if(s.creatures.length>=48)throw Error('Living population capacity48 reached.');
    const c=founder(s.nextId++,s.definition.seed);
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
  s.editsApplied++;trimArchive(s);assertWorld(s);return {world:s,edit:e};
}
export function metrics(s:World) {
  const food=s.food.reduce((a,b)=>a+b,0),stores=s.creatures.reduce((n,c)=>n+c.energy,0),structure=s.creatures.reduce((n,c)=>n+c.size*8,0);
  const supplied=s.initial+s.sunlight+s.externalIn,accounted=food+stores+structure+s.dissipated+s.externalOut;
  return {population:s.creatures.length,births:s.retired.births+s.lineage.filter(l=>l.parent!==null).length,
    introduced:s.retired.introduced+s.lineage.filter(l=>l.parent===null).length,removed:s.retired.removed+s.lineage.filter(l=>l.deathReason==='removed by user').length,
    deaths:s.retired.deaths+s.lineage.filter(l=>l.died!==null&&l.deathReason!=='removed by user').length,
    intake:s.retired.intake+s.lineage.reduce((n,l)=>n+l.intake,0),moves:s.retired.moves+s.lineage.reduce((n,l)=>n+l.distance,0),turns:s.retired.turns+s.lineage.reduce((n,l)=>n+l.turns,0),
    updates:s.retired.updates+s.lineage.reduce((n,l)=>n+l.updates,0),acceptedChanges:s.retired.acceptedChanges+s.lineage.filter(l=>l.layoutMutation).length,
    enabledProposals:s.retired.enabledProposals+s.lineage.filter(l=>l.layoutAttempt&&!l.layoutAttempt.includes('disabled')).length,
    maxDeveloped:Math.max(s.retired.maxDeveloped,...s.lineage.map(l=>l.developed)),retiredRecords:s.retired.records,retainedGenomes:new Set(s.lineage.map(l=>layoutKey(l.genes.layout))).size,
    initial:s.initial,sunlight:s.sunlight,externalIn:s.externalIn,externalOut:s.externalOut,food,stores,structure,dissipated:s.dissipated,supplied,accounted,exact:supplied===accounted};
}
export class TestSession {
  readonly initial:Configuration;
  private world:World;
  private edits:Edit[]=[];
  private checkpoint:World;
  private undoBefore:World|null=null;
  private errors:string[]=[];
  undoCount=0;
  failure='';
  constructor(input:unknown){this.initial=validateConfig(input);this.world=initialize(this.initial);this.checkpoint=copy(this.world);}
  snapshot(){return copy(this.world);}
  get tick(){return this.world.tick;}
  get editCount(){return this.world.editsApplied;}
  get canUndo(){return this.undoBefore!==null;}
  get complete(){return this.world.definition.test.steps!==null&&this.world.tick>=this.world.definition.test.steps;}
  recordError(message:string){this.errors.push(message.slice(0,2000));this.errors=this.errors.slice(-10);}
  edit(input:unknown){
    try {
      if(this.edits.length>=256){this.checkpoint=copy(this.world);this.edits=[];}
      const next=applyEdit(this.world,input);this.undoBefore=this.world;this.world=next.world;this.edits.push(next.edit);
    }catch(e){this.recordError(e instanceof Error?e.message:'Edit failed.');throw e;}
  }
  undo(){if(!this.undoBefore)throw Error('Undo is available only before the next step.');this.world=this.undoBefore;this.undoBefore=null;this.edits.pop();this.undoCount++;}
  advance(){
    if(this.complete||this.failure)return;
    try {this.world=step(this.world);this.undoBefore=null;if(this.world.tick-this.checkpoint.tick>=1000){this.checkpoint=copy(this.world);this.edits=[];}}
    catch(e){this.failure=e instanceof Error?e.message:'Engine failed.';this.recordError(this.failure);throw e;}
  }
  recipe(){return {initial:this.initial,checkpoint:encodeCheckpoint(this.checkpoint),edits:structuredClone(this.edits),tick:this.world.tick,undoCount:this.undoCount,errors:[...this.errors],failure:this.failure};}
}
export function encodeCheckpoint(s:World){return {...copy(s),food:Array.from(s.food)};}
export function decodeCheckpoint(input:unknown):World {
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid checkpoint.');
 const raw=input as ReturnType<typeof encodeCheckpoint>,definition=validateConfig(raw.definition);
 if(!Array.isArray(raw.food)||raw.food.length!==definition.world.width*definition.world.height||raw.food.some(n=>!Number.isInteger(n)||n<0||n>96)||!Array.isArray(raw.creatures)||raw.creatures.length>48||!Array.isArray(raw.lineage)||raw.lineage.length>256||!Array.isArray(raw.history)||raw.history.length>81||!Array.isArray(raw.events)||raw.events.length>40)throw Error('Invalid checkpoint dimensions/bounds.');
 const keys=(value:unknown,template:object)=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==Object.keys(template).length||Object.keys(template).some(k=>!Object.hasOwn(value,k)))throw Error('Unsupported checkpoint fields.');};
 keys(raw,initialize(definition));keys(raw.retired,emptyRetired());
 const model=founder(1,definition.seed);for(const c of raw.creatures){keys(c,model);keys(c.genes,model.genes);}for(const l of raw.lineage){keys(l,archive(model));keys(l.genes,model.genes);}
 const s={...raw,definition,food:Uint16Array.from(raw.food)} as World;
 assertWorld(s);return copy(s);
}
export function replay(checkpoint:unknown,edits:unknown,tick:number):World {
 integer(tick,0,Number.MAX_SAFE_INTEGER);if(!Array.isArray(edits)||edits.length>256)throw Error('Invalid replay edit budget.');
 let s=decodeCheckpoint(checkpoint),i=0;
 if(tick<s.tick||tick-s.tick>1000)throw Error('Replay segment must contain at most1000 steps.');
 while(true){
  while(i<edits.length&&(edits[i] as Record<string,unknown>)?.tick===s.tick){s=applyEdit(s,edits[i]).world;i++;}
  if(s.tick===tick)break;s=step(s);
 }
 if(i!==edits.length)throw Error('Replay edits are out of order or beyond reported tick.');return s;
}
export function canonicalState(s:World):string {
  return JSON.stringify(s,(_key,value)=>value instanceof Uint16Array?Array.from(value):
    value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(key=>[key,value[key]])):value);
}
