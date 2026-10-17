import {createHash} from 'node:crypto';
import {describe,expect,it} from 'vitest';
import {parseConfig,presetConfig,validateConfig} from '../src/testfield/config';
import {assertWorld,initialize,step,parts} from '../src/testfield/engine';
import {canonicalState,metrics,replay,TestSession} from '../src/testfield/session';
import {makeReport,parseReport,reportText,verifyReport} from '../src/testfield/report';
import Ajv from 'ajv';
import schema from '../schemas/test-field-v1.schema.json';
import example from '../examples/test-field.v1.json';
import {resourceReward} from '../src/testfield/mechanics';
const digest=async(text:string)=>createHash('sha256').update(text).digest('hex');
describe('controlled test field',()=>{
 it('keeps the portable schema/example and expanded reward bounds aligned with the runtime',()=>{
  const check=new Ajv().compile(schema);expect(check(example)).toBe(true);expect(validateConfig(example)).toEqual(example);
  expect(resourceReward(96,5,18)).toBe(32);expect(resourceReward(0,5,18)).toBe(-23);expect(()=>resourceReward(0,0,19)).toThrow();
 });
 it.each(['feeding','growth','inheritance','empty'] as const)('finishes the full horizon with maximal resource rates in %s',preset=>{
  let s=initialize(validateConfig({...presetConfig(preset),world:{width:16,height:16},rules:{foodEnergy:96,sunlight:8,upkeep:3}}));
  for(let tick=0;tick<1600;tick++)s=step(s);
  expect(s.tick).toBe(1600);expect(metrics(s).exact).toBe(true);expect(s.history).toHaveLength(81);
 });
 it('validates strict copied config boundaries without coercion',()=>{
  const c=presetConfig('feeding');expect(Object.isFrozen(c.rules)).toBe(true);
  for(const bad of [{...c,extra:0},{...c,seed:'42'},{...c,world:{width:15,height:24}},
   {...c,rules:{...c.rules,upkeep:4}},{...c,organisms:{...c.organisms,learning:1}},{...c,test:{preset:'other',steps:200}}])expect(()=>validateConfig(bad)).toThrow();
  expect(()=>parseConfig(' '.repeat(65537))).toThrow(/64KiB/);
 });
 it('runs every scenario at both grid extremes with exact resources and isolated snapshots',()=>{
  for(const preset of ['feeding','growth','inheritance','empty'] as const)for(const [width,height]of [[16,16],[64,48]]){
   const config=validateConfig({...presetConfig(preset),world:{width,height}});let s=initialize(config);const old=canonicalState(s);
   const next=step(s);expect(canonicalState(s)).toBe(old);expect(metrics(next).exact).toBe(true);
   for(let i=0;i<60;i++)s=step(s);
   expect(metrics(s).exact).toBe(true);assertWorld(s);
   expect(s.creatures.every(c=>parts(c).every(p=>p.x>=0&&p.x<width!&&p.y>=0&&p.y<height!))).toBe(true);
  }
 });
 it('accounts hand-worked food, authored bodies, erase and clear without pretending removals are biological deaths',()=>{
  const session=new TestSession(presetConfig('empty'));
  session.edit({tick:0,kind:'food',x:10,y:10});session.edit({tick:0,kind:'food',x:10,y:10});
  expect(metrics(session.snapshot()).externalIn).toBe(24);
  session.edit({tick:0,kind:'add',x:6,y:6,direction:0,bodyPlan:'dart'});
  expect(metrics(session.snapshot())).toMatchObject({externalIn:168,stores:120,structure:24,introduced:1,births:0,exact:true});
  session.edit({tick:0,kind:'erase',x:6,y:6});
  expect(metrics(session.snapshot())).toMatchObject({externalOut:144,removed:1,deaths:0,population:0,exact:true});
  session.edit({tick:0,kind:'clear'});expect(metrics(session.snapshot())).toMatchObject({externalIn:168,externalOut:168,exact:true});
 });
 it('rejects out-of-bounds/overlapping/unknown edits and reset-only config without mutating state or replay',()=>{
  const session=new TestSession(presetConfig('empty'));session.edit({tick:0,kind:'add',x:5,y:5,direction:0,bodyPlan:'grazer'});
  const before=canonicalState(session.snapshot()),edits=session.recipe().edits;
  for(const edit of [{tick:1,kind:'clear'},{tick:0,kind:'food',x:-1,y:0},{tick:0,kind:'add',x:5,y:5,direction:0,bodyPlan:'dart'},
   {tick:0,kind:'config',config:{...presetConfig('empty'),seed:7}},{tick:0,kind:'clear',extra:1}])expect(()=>session.edit(edit)).toThrow();
  expect(canonicalState(session.snapshot())).toBe(before);expect(session.recipe().edits).toEqual(edits);
 });
 it('replays real same-tick edits, live learning/rules and endpoint edits exactly; undo expires on advancement',()=>{
  const session=new TestSession(presetConfig('feeding'));
  session.edit({tick:0,kind:'food',x:1,y:1});session.undo();expect(session.recipe().edits).toHaveLength(0);
  for(let i=0;i<20;i++)session.advance();expect(()=>session.undo()).toThrow();
  const c=session.snapshot().definition;
  expect(()=>session.edit({tick:20,kind:'config',config:{...c,test:{...c.test,steps:1}}})).toThrow(/limit/);
  session.edit({tick:20,kind:'config',config:{...c,rules:{...c.rules,upkeep:3},organisms:{...c.organisms,learning:false}}});
  const updates=metrics(session.snapshot()).updates;
  for(let i=0;i<8;i++)session.advance();expect(metrics(session.snapshot()).updates).toBe(updates);
  session.edit({tick:28,kind:'food',x:1,y:1});
  const r=session.recipe();expect(canonicalState(replay(r.initial,r.edits,r.tick))).toBe(canonicalState(session.snapshot()));
  const snapshot=session.snapshot();snapshot.food.fill(0);expect(metrics(session.snapshot()).exact).toBe(true);
 });
 it('bounds commands, replay ordering and absolute test horizon',()=>{
  const c=validateConfig({...presetConfig('empty'),test:{preset:'empty',steps:1}}),s=new TestSession(c);
  for(let i=0;i<256;i++)s.edit({tick:0,kind:'food',x:0,y:0});expect(()=>s.edit({tick:0,kind:'clear'})).toThrow(/256/);
  s.advance();s.advance();expect(s.snapshot().tick).toBe(1);expect(s.complete).toBe(true);
  expect(()=>replay(c,[{tick:1,kind:'clear'},{tick:0,kind:'clear'}],1)).toThrow();expect(()=>replay(c,[],1601)).toThrow();
 });
 it('copies complete/pending reports and verifies actual recipe, ledger and final SHA256, rejecting tampering',async()=>{
  const s=new TestSession(validateConfig({...presetConfig('feeding'),test:{preset:'feeding',steps:16}}));
  for(let i=0;i<16;i++)s.advance();
  const r=await makeReport(s,{source:{revision:'test',dirty:true},browser:'test browser',viewport:{width:390,height:844}},false,'It turned.',digest);
  expect(r.status).toBe('completed');expect((await verifyReport(parseReport(reportText(r)),digest)).metrics.exact).toBe(true);
  await expect(verifyReport({...r,finalHash:'0'.repeat(64)},digest)).rejects.toThrow(/state/);
  await expect(verifyReport({...r,metrics:{...r.metrics,population:999}},digest)).rejects.toThrow(/analytics/);
  expect(()=>parseReport('x'.repeat(1048577))).toThrow(/1MiB/);
 });
});
