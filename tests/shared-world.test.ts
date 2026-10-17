import {describe,it,expect} from 'vitest';
import {createHash} from 'node:crypto';
import Ajv from 'ajv';
import schema from '../schemas/world-v1.schema.json';
import example from '../examples/world.v1.json';
import {presetConfig,validateConfig,parseConfig} from '../src/world/config';
import {initialize,step,copy,assertWorld} from '../src/world/engine';
import {TestSession,metrics,canonicalState} from '../src/world/session';
import {makeReport,verifyReport} from '../src/world/report';
import {createController} from '../src/ecology/learning-controller';
const digest=async(s:string)=>createHash('sha256').update(s).digest('hex');
const context={source:{revision:'test',dirty:true},browser:'unit',viewport:{width:1600,height:1000}};
function rich(){const c=presetConfig('inheritance');return validateConfig({...c,rules:{...c.rules,foodEnergy:96,spawnAttempts:8,initialFood:500,foodCap:null,supplyBudget:null},test:{...c.test,steps:null}});}
describe('one shared configurable world',()=>{
 it('validates JSON/schema and rejects unknown choices without coercion',()=>{
  const validate=new Ajv().compile(schema);expect(validate(example)).toBe(true);expect(validateConfig(example)).toEqual(example);
  for(const bad of [{...example,extra:1},{...example,rules:{...example.rules,replenishment:1}},{...example,test:{...example.test,steps:0}},{...example,organisms:{...example.organisms,inheritWeights:'true'}}]){expect(validate(bad)).toBe(false);expect(()=>validateConfig(bad)).toThrow();}
  expect(()=>parseConfig(' '.repeat(65537))).toThrow(/64KiB/);
 });
 it('starts neutral organisms with common genes/energy, balanced headings and no individual food gifts',()=>{
  const c=presetConfig(),s=initialize(c);expect(s.creatures).toHaveLength(4);
  expect(new Set(s.creatures.map(x=>JSON.stringify(x.genes))).size).toBe(1);
  expect(s.creatures.map(x=>x.direction)).toEqual([0,1,2,3]);expect(s.creatures.every(x=>x.energy===120)).toBe(true);
  expect(s.food.filter(n=>n>0)).toHaveLength(150);expect(s.food.reduce((a,b)=>a+b,0)).toBe(150*24);
  expect(canonicalState(initialize(c))).toBe(canonicalState(s));
 });
 it('respects standing energy and cumulative supply caps exactly, including a partial final patch',()=>{
  let c=presetConfig('empty');c=validateConfig({...c,rules:{...c.rules,initialFood:0,foodCap:25,supplyBudget:25,spawnAttempts:8},test:{...c.test,steps:null}});
  let s=initialize(c);for(let i=0;i<10;i++)s=step(s);
  expect(metrics(s)).toMatchObject({food:25,sunlight:25,exact:true});
  const session=new TestSession(c);session.advance();session.edit({tick:1,kind:'clear'});session.advance();expect(metrics(session.snapshot()).sunlight).toBe(25);
 });
 it('switches replenishment off and rejects destructive cap edits without changing the run',()=>{
  const c=presetConfig('empty'),session=new TestSession({...c,rules:{...c.rules,replenishment:false}});for(let i=0;i<20;i++)session.advance();expect(metrics(session.snapshot()).sunlight).toBe(0);
  session.edit({tick:20,kind:'food',x:4,y:4});const before=canonicalState(session.snapshot());
  expect(()=>session.edit({tick:20,kind:'config',config:{...c,rules:{...c.rules,foodCap:1}}})).toThrow(/cap/);expect(canonicalState(session.snapshot())).toBe(before);
  expect(()=>session.edit({tick:20,kind:'food',x:999,y:4})).toThrow();expect(canonicalState(session.snapshot())).toBe(before);
 });
 it('uses optional stopping semantics and can extend or remove the endpoint',()=>{
  const c=presetConfig('empty'),session=new TestSession({...c,test:{...c.test,steps:2}});session.advance();session.advance();session.advance();expect(session.tick).toBe(2);expect(session.complete).toBe(true);
  session.edit({tick:2,kind:'config',config:{...c,test:{...c.test,steps:null}}});session.advance();expect(session.tick).toBe(3);expect(session.complete).toBe(false);
 });
 it('runs past1600 and256 historical organisms with bounded archives and continuing reproduction',()=>{
  let s=initialize(rich());let birthsAtArchive=0,at=0;
  for(let i=0;i<8000;i++){s=step(s);if(!at&&s.nextId>300){at=s.tick;birthsAtArchive=metrics(s).births;}}
  expect(at).toBeGreaterThan(0);expect(metrics(s).births).toBeGreaterThan(birthsAtArchive);expect(s.lineage.length).toBeLessThanOrEqual(256);expect(s.history.length).toBeLessThanOrEqual(81);expect(s.retired.records).toBeGreaterThan(0);expect(metrics(s).exact).toBe(true);expect(s.nextId).toBeGreaterThan(300);assertWorld(s);
 },30000);
 it('disables reproduction independently and explicitly resets or inherits body, traits and weights',()=>{
  for(const inherited of [false,true]){
   const config=rich(),s=initialize({...config,organisms:{...config.organisms,traitMutation:false,structuralMutation:false,inheritBody:inherited,inheritTraits:inherited,inheritWeights:inherited,bodyPlan:'dart'}});
   const c=s.creatures[0]!;c.age=39;c.genes={...c.genes,sense:8,foodWeight:5};c.controller={...c.controller,weights:c.controller.weights.map((row,i)=>row.map((w,j)=>i===0&&j===0?321:w))};
   // A valid four-cell parent, paid for from stores; offspring reset baseline is dart.
   c.genes.layout=[...c.genes.layout,{x:1,y:0,role:'sensor'}];c.size=4;c.energy-=8;const record=s.lineage[0]!;record.genes={...c.genes};record.developed=4;
   const next=step(s),child=next.creatures.find(x=>x.parent===c.id)!;expect(child).toBeDefined();expect(next.lineage.find(l=>l.id===child.id)?.inheritance).toEqual({body:inherited,traits:inherited,weights:inherited});
   expect(child.genes.sense).toBe(inherited?8:6);expect(child.genes.layout.length).toBe(inherited?4:3);expect(child.controller.updates).toBe(0);
   expect(child.controller.weights).toEqual(inherited?c.controller.weights:createController(child.genes.foodWeight,child.genes.inertia).weights);
   child.controller={...child.controller,weights:child.controller.weights.map((row,i)=>row.map((w,j)=>i===0&&j===0?99:w))};expect(c.controller.weights[0]![0]).toBe(321);
  }
  let s=initialize({...rich(),organisms:{...rich().organisms,reproduction:false}});for(let i=0;i<100;i++)s=step(s);expect(metrics(s).births).toBe(0);
 });
 it('keeps rejected edits/snapshots isolated and learning off freezes existing weights',()=>{
  const config=rich(),session=new TestSession(config);for(let i=0;i<20;i++)session.advance();const snapshot=session.snapshot(),updates=metrics(snapshot).updates;
  session.edit({tick:20,kind:'config',config:{...config,organisms:{...config.organisms,learning:false,reproduction:false}}});for(let i=0;i<10;i++)session.advance();expect(metrics(session.snapshot()).updates).toBe(updates);
  const before=canonicalState(session.snapshot());const cloned=copy(snapshot);cloned.food.fill(0);expect(canonicalState(session.snapshot())).toBe(before);
 });
 it('replays reports from genesis and later bounded checkpoints; rejects tampering',async()=>{
  const c=presetConfig('empty'),session=new TestSession({...c,test:{...c.test,steps:null}});session.edit({tick:0,kind:'food',x:2,y:2});session.advance();
  const early=await makeReport(session,context,false,'same world',digest);expect((await verifyReport(early,digest)).scope).toBe('from-genesis');
  for(let i=1;i<2201;i++)session.advance();session.edit({tick:2201,kind:'clear'});session.edit({tick:2201,kind:'food',x:3,y:3});
  const report=await makeReport(session,context,false,'long run',digest);const result=await verifyReport(report,digest);expect(result.scope).toBe('latest-segment');expect(report.checkpoint.tick).toBe(2000);expect(result.world.tick).toBe(2201);
  expect(report.edited).toBe(true);expect(report.status).toBe('paused');expect(report.requestedSteps).toBe(null);
  await expect(verifyReport({...report,finalHash:'0'.repeat(64)},digest)).rejects.toThrow(/state/);
  await expect(verifyReport({...report,metrics:{...report.metrics,births:999}},digest)).rejects.toThrow(/analytics/);
  await expect(verifyReport({...report,status:'completed'},digest)).rejects.toThrow(/status/);
 });
 it('keeps repeated author edits and IDs working after history rolls over',async()=>{
  const c=presetConfig('empty'),session=new TestSession({...c,test:{...c.test,steps:null}});
  for(let i=0;i<300;i++){session.edit({tick:0,kind:'add',x:5,y:5,direction:0,bodyPlan:'dart'});session.edit({tick:0,kind:'erase',x:5,y:5});}
  const s=session.snapshot();expect(s.nextId).toBe(301);expect(metrics(s)).toMatchObject({introduced:300,removed:300,population:0,exact:true});expect(s.lineage).toHaveLength(256);
  expect(session.recipe().edits.length).toBeLessThanOrEqual(256);await verifyReport(await makeReport(session,context,false,'',digest),digest);
 });
});
