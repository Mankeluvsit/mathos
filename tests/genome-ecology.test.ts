import {expect,it} from 'vitest';
import Ajv from 'ajv';
import schema from '../schemas/ecology-v4.schema.json';
import example from '../examples/ecology.v4.json';
import {initialize,step,copy,assertWorld,validate,type World} from '../src/ecology/genome-model';
import {founderLayout,layoutKey,validateLayout} from '../src/ecology/body-genome';
import {createController,deriveStreams,learn} from '../src/ecology/learning-controller';
import {ecologyMetrics,initializeEcology,copyEcology,isGenome,cellParts,body,parseEcology} from '../src/ecology/world';
import {exportObservations} from '../src/ecology/observations';
import {saveEcology,loadEcology} from '../src/ecology/storage';
import {compareLearning} from '../src/ecology/learning-experiments';
import {EcologyRuntime} from '../src/runtime/ecology-runtime';
const def={format:'mathos-ecology',version:4,seed:42,mode:'seeded',learning:true,structuralMutation:true} as const;
function balance(s:World){s.initial=ecologyMetrics(s).accounted-s.sunlight;assertWorld(s);}
function solo(){const s=initialize(def);s.creatures=s.creatures.slice(0,1);s.lineage=s.lineage.slice(0,1);s.food.fill(0);balance(s);return s;}
it('validates explicit v4 settings and isolates schema, old versions and storage',()=>{
 const check=new Ajv().compile(schema);expect(check(example)).toBe(true);expect(validate(example)).toEqual(def);
 for(const d of [{...def,structuralMutation:undefined},{...def,structuralMutation:1},{...def,extra:1},{...def,version:5}]){expect(check(d)).toBe(false);expect(()=>parseEcology(JSON.stringify(d))).toThrow();}
 const map=new Map<string,string>(),port={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);}};
 saveEcology(port,def);expect(loadEcology(port,4)).toEqual(def);expect(()=>loadEcology(port,3)).toThrow();
 expect(isGenome(initializeEcology(def))).toBe(true);expect(initializeEcology({format:'mathos-ecology',version:3,seed:42,mode:'seeded',learning:true})).toBeDefined();
});
it('charges exactly8 for a developed cell and defers decisions until motor development',()=>{
 let s=solo();const c=s.creatures[0]!;c.size=2;c.age=9;c.energy=100;balance(s);const before=copy(s);
 s=step(s);expect(before.creatures[0]!.size).toBe(2);expect(s.creatures[0]).toMatchObject({size:3,energy:90});expect(s.creatures[0]!.controller.updates).toBe(0);
 expect(s.lineage[0]!.developed).toBe(3);expect(ecologyMetrics(s).accounted).toBe(ecologyMetrics(s).supplied);
 s=step(s);expect(s.creatures[0]!.controller.updates).toBe(1);
});
it('delays occupied growth without spending structure and succeeds after the obstacle dies',()=>{
 let s=solo();const c=s.creatures[0]!;c.size=2;c.age=9;c.energy=100;
 const obstacle={...copy(s).creatures[0]!,id:2,x:c.x+1,y:c.y+1,direction:3,size:2,energy:0,age:0};
 s.creatures.push(obstacle);s.lineage.push({...s.lineage[0]!,id:2,developed:2});balance(s);
 s=step(s);expect(s.creatures[0]).toMatchObject({size:2,energy:98});expect(s.creatures).toHaveLength(1);
 s=step(s);expect(s.creatures[0]).toMatchObject({size:3,energy:88});expect(ecologyMetrics(s).accounted).toBe(ecologyMetrics(s).supplied);
});
it('inherits an accepted spatial mutation, resets experience and grows the new cell from resources',()=>{
 const s=solo(),c=s.creatures[0]!;c.genes.bodyPlan='grazer';c.genes.layout=founderLayout('grazer');c.size=4;c.age=39;c.energy=500;
 c.controller=learn(c.controller,{input:[64,0,0,0,0,0],action:0,reward:32,nextInput:null,enabled:true}).controller;s.tick=1;
 s.lineage[0]!.genes={...c.genes,layout:c.genes.layout};s.lineage[0]!.developed=4;s.reproductionRng=720;balance(s);
 const next=step(s),child=next.creatures.find(c=>c.parent===1)!;expect(child).toBeDefined();expect(child.genes.layout).toHaveLength(5);
 expect(child.genes.layout[4]).toEqual({x:-1,y:1,role:'motor'});expect(child.size).toBe(2);
 expect(child.controller).toEqual(createController(child.genes.foodWeight,child.genes.inertia));expect(child.explorationRng).toBe(deriveStreams(42,child.id).exploration);
 expect(next.lineage.find(l=>l.id===child.id)).toMatchObject({layoutAttempt:'add: accepted',layoutMutation:expect.stringContaining('→'),developed:2});
 expect(c.genes.layout).toHaveLength(4);expect(child.genes.layout).not.toBe(next.lineage.find(l=>l.id===child.id)!.genes.layout);
 const growth=solo();const grown=growth.creatures[0]!;grown.genes.layout=validateLayout([...founderLayout('grazer'),{x:-1,y:1,role:'motor'}]);grown.size=4;grown.age=29;grown.energy=200;grown.lastBirth=1000;growth.lineage[0]!.genes={...grown.genes};growth.lineage[0]!.developed=4;
 balance(growth);const after=step(growth);expect(after.creatures[0]!.size).toBe(5);expect(after.lineage[0]!.developed).toBe(5);expect(ecologyMetrics(after).accounted).toBe(ecologyMetrics(after).supplied);
});
it('disables only structural mutation without changing birth RNG draws or copying parental learning',()=>{
 function birth(flag:boolean){const s=solo();s.definition=validate({...def,structuralMutation:flag});const c=s.creatures[0]!;c.genes.layout=founderLayout('grazer');c.size=4;c.age=39;c.energy=500;s.reproductionRng=720;s.lineage[0]!.genes={...c.genes};s.lineage[0]!.developed=4;balance(s);return step(s);}
 const on=birth(true),off=birth(false);expect(on.reproductionRng).toBe(off.reproductionRng);
 expect(off.creatures.find(c=>c.parent===1)!.genes.layout).toEqual(founderLayout('grazer'));
 expect(off.lineage.at(-1)!.layoutAttempt).toBe('structural mutations disabled');
 expect(off.lineage.at(-1)!.layoutMutation).toBe('');
});
it('deep-copies genomes/diagnostics and exports actual morphology with explicit provenance',()=>{
 const runtime=new EcologyRuntime(def);runtime.singleStep();const snapshot=runtime.snapshot();if(!isGenome(snapshot))throw Error('wrong model');
 const original=copy(snapshot);(snapshot.creatures[0]!.genes.layout[0] as {x:number}).x=2;
 expect(runtime.snapshot()).toEqual(original);expect(copyEcology(original)).toEqual(original);
 const out=exportObservations(original);expect(out).toMatchObject({version:3,engine:'ecology-reference@4',bodyGenome:'cell-layout@1'});
 (out.lineage[0]!.genes as typeof original.lineage[0]['genes']).layout=[...founderLayout('scout')];expect(original.lineage[0]!.genes.layout).toHaveLength(3);
 const c=original.creatures[1]!;expect(body(c)).toEqual(cellParts(c).map(p=>p.y*64+p.x));runtime.dispose();
});
it('runs model-correct paired comparisons, retaining exact accounting and honest cancellation',async()=>{
 const r=await compareLearning({revision:'test',dirty:true},new AbortController().signal,()=>{},async()=>{},16,{version:4,structuralMutation:true});
 expect(r).toMatchObject({version:2,engine:'ecology-reference@4',bodyGenome:'cell-layout@1',status:'completed'});expect(r.runs).toHaveLength(12);
 for(const run of r.runs){expect(run.definition.version).toBe(4);expect(run.metrics.accounted).toBe(run.metrics.supplied);expect(run.updates).toBe(run.definition.learning?128:0);}
 const signal=new AbortController();const partial=await compareLearning({revision:'test',dirty:true},signal.signal,()=>signal.abort(),async()=>{},16,{version:4,structuralMutation:false});expect(partial.status).toBe('cancelled');expect(partial.runs).toHaveLength(1);
});
it('keeps primordial resource-only and preserves deterministic inherited layouts without adaptive claims',()=>{
 const empty=step(initialize({...def,mode:'primordial'}));expect(empty.creatures).toHaveLength(0);expect(empty.lineage).toHaveLength(0);
 let a=initialize(def),b=initialize(def);for(let i=0;i<240;i++){a=step(a);b=step(b);}
 expect(a).toEqual(b);expect(a.lineage.length).toBeGreaterThan(8);for(const l of a.lineage)expect(()=>validateLayout(l.genes.layout)).not.toThrow();
 expect(new Set(a.creatures.map(c=>layoutKey(c.genes.layout))).size).toBeGreaterThanOrEqual(1);
 expect(ecologyMetrics(a).accounted).toBe(ecologyMetrics(a).supplied);
});

it('supports resource-funded six-cell development and actual larger-body learning rewards',()=>{
 let s=solo();const c=s.creatures[0]!;c.genes.layout=validateLayout([...founderLayout('grazer'),{x:-1,y:0,role:'motor'},{x:-1,y:-1,role:'sensor'}]);c.size=5;c.age=39;c.energy=200;c.lastBirth=1000;s.lineage[0]!.genes={...c.genes};s.lineage[0]!.developed=5;balance(s);
 s=step(s);expect(s.creatures[0]!.size).toBe(6);s=step(s);expect(s.creatures[0]!.lastDecision!.upkeep).toBe(6);expect(ecologyMetrics(s).accounted).toBe(ecologyMetrics(s).supplied);
});
