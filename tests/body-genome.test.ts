import {expect,it} from 'vitest';
import reference from './fixtures/body-genome.v1.json';
import {validateLayout,founderLayout,parts,canTurn,fits,mutationProposal,forwardCost,layoutKey} from '../src/ecology/body-genome';
import {sense,act,resourceReward} from '../src/ecology/genome-mechanics';
import {initialize,intake,type Creature} from '../src/ecology/genome-model';
const def={format:'mathos-ecology',version:4,seed:42,mode:'seeded',learning:true,structuralMutation:true} as const;
function actor():Creature{return initialize(def).creatures[0]!;}
it('matches independent Python geometry for every prefix and all four headings',()=>{
 for(const f of reference.frames){const genes={layout:validateLayout(f.layout)};expect(parts({x:10,y:10,direction:f.direction,size:f.size,genes})).toEqual(f.expected);}
 for(const test of reference.validation){if(test.valid)expect(()=>validateLayout(test.layout)).not.toThrow();else expect(()=>validateLayout(test.layout)).toThrow();}
 expect(Object.isFrozen(validateLayout(founderLayout('dart'))[0])).toBe(true);
});
it('uses every actual genome cell for footprint, walls and conservative turn sweeps',()=>{
 const c=actor();c.x=10;c.y=10;c.genes.layout=validateLayout([...founderLayout('grazer'),{x:2,y:0,role:'sensor'}]);c.size=5;
 expect(fits(c,new Set([10*64+12]))).toBe(false);
 expect(canTurn(c,1,new Set([11*64+11]))).toBe(false); // interior of the long accessory sweep, not either endpoint
 expect(canTurn(c,1,new Set())).toBe(true);expect(canTurn(c,2,new Set())).toBe(false);
 c.x=62;expect(fits(c,new Set())).toBe(false);
});
it('performs deterministic bounded spatial mutations and preserves input genomes',()=>{
 const dart=founderLayout('dart'),before=layoutKey(dart);
 expect(mutationProposal(dart,4096).layout).toEqual(founderLayout('grazer'));
 expect(mutationProposal(dart,0)).toMatchObject({mutation:'',attempt:expect.stringContaining('invalid')});
 expect(mutationProposal(dart,16).mutation).toBe('');
 const grazer=founderLayout('grazer');
 expect(mutationProposal(grazer,16).layout).toEqual(dart);
 expect(mutationProposal(grazer,32).layout[3]!.role).toBe('motor');
 expect(mutationProposal(grazer,48+8192).layout[3]).toEqual({x:1,y:1,role:'mouth'});
 expect(mutationProposal(grazer,48+4096).mutation).toBe('');
 expect(mutationProposal(grazer,3*1048576+4096).layout[4]).toEqual({x:2,y:0,role:'mouth'});
 expect(layoutKey(dart)).toBe(before);
 for(const word of [-1,1.5,4294967296,NaN])expect(()=>mutationProposal(dart,word)).toThrow();
});
it('makes developed mouths, sensors and motors functional at their actual loci',()=>{
 const s=initialize(def),c=s.creatures[0]!;s.food.fill(0);
 c.x=20;c.y=20;c.direction=0;c.energy=100;c.genes.layout=validateLayout([...founderLayout('dart'),{x:-1,y:0,role:'mouth'}]);
 s.food[20*64+18]=24;expect(intake(s,c)).toBe(0);c.size=4;expect(intake(s,c)).toBe(24);expect(c.energy).toBe(124);
 c.genes.layout=validateLayout([...founderLayout('scout'),{x:1,y:1,role:'sensor'}]);c.size=5;
 s.food.fill(0);s.food[9*64+20]=24;expect(sense(c,s.food)[0]).toBe(2);
 c.size=4;expect(sense(c,s.food)[0]).toBe(0);
 c.genes.layout=validateLayout([...founderLayout('dart'),{x:1,y:0,role:'mouth'},{x:-1,y:0,role:'motor'},{x:-1,y:-1,role:'sensor'}]);c.size=6;
 expect(forwardCost(c)).toBe(4);const energy=c.energy;expect(act(c,0,new Set())).toBe(4);expect(c.energy).toBe(energy-4);expect(c.y).toBe(19);
 c.genes.layout=validateLayout(c.genes.layout.map((p,i)=>i===4?{...p,role:'mouth'}:p));expect(forwardCost(c)).toBe(5);
});

it('bounds the larger v4 measured reward without changing the learning equation',()=>{
 expect(resourceReward(96,5,6)).toBe(32);expect(resourceReward(0,5,6)).toBe(-11);expect(resourceReward(24,4,5)).toBe(15);
 for(const values of [[97,0,0],[0,6,0],[0,0,7],[-1,0,0],[0,0,1.5]])expect(()=>resourceReward(values[0]!,values[1]!,values[2]!)).toThrow();
});
it('bounds multiple mouths by96 measured units and the600 storage capacity',()=>{
 const s=initialize(def),c=s.creatures[0]!;c.x=20;c.y=20;c.energy=100;
 c.genes.layout=validateLayout([...founderLayout('grazer'),{x:1,y:-1,role:'mouth'},{x:2,y:-1,role:'mouth'}]);c.size=6;s.food.fill(0);
 for(const p of parts(c).filter(p=>p.role==='mouth'))s.food[p.y*64+p.x]=24;
 expect(intake(s,c)).toBe(96);expect(c.energy).toBe(196);
 s.food.fill(0);for(const p of parts(c).filter(p=>p.role==='mouth'))s.food[p.y*64+p.x]=24;c.energy=590;
 expect(intake(s,c)).toBe(10);expect(c.energy).toBe(600);expect(s.food.reduce((a,b)=>a+b,0)).toBe(86);
});
