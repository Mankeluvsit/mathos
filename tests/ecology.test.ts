import { expect, it } from 'vitest';
import { body, copyEcology, ecologyMetrics, initializeEcology, parseEcology, senseFood, stepEcology, validateEcology, END, W } from '../src/ecology/model';
const definition = validateEcology({format:'mathos-ecology',version:1,seed:42,mode:'seeded'});
it('initializes eight separated functional bodies and declared resources',()=>{
 const s=initializeEcology(definition);expect(s.creatures).toHaveLength(8);expect(new Set(s.creatures.flatMap(body)).size).toBe(24);expect(ecologyMetrics(s).supplied).toBe(ecologyMetrics(s).accounted);
});
it('senses only nearby food with directional integer scores',()=>{
 const s=initializeEcology(definition),c=s.creatures[0]!;s.food.fill(0);s.food[(c.y-2)*W+c.x]=24;
 expect(senseFood(c,s.food)).toEqual([12,0,0,0]);s.food[(c.y+10)*W+c.x]=24;expect(senseFood(c,s.food)).toEqual([12,0,0,0]);
});
it('actually moves motorized bodies and preserves predecessor state',()=>{
 const s=initializeEcology(definition),before=copyEcology(s),next=stepEcology(s);
 expect(next.creatures.some(c=>c.x!==s.creatures.find(o=>o.id===c.id)!.x||c.y!==s.creatures.find(o=>o.id===c.id)!.y)).toBe(true);
 expect(s).toEqual(before);expect(next.food).not.toBe(s.food);expect(next.creatures[0]!.genes).not.toBe(s.creatures[0]!.genes);
});
it('keeps bounded, individually sized bodies through births, mutation and death with exact resource funding',()=>{
 let s=initializeEcology(definition),replay=initializeEcology(definition);let grew=false;
 for(let t=0;t<END;t++){
  s=stepEcology(s);expect(ecologyMetrics(s).accounted).toBe(ecologyMetrics(s).supplied);expect(s.creatures.length).toBeLessThanOrEqual(48);
  grew ||= s.creatures.some(c=>c.parent!==null&&c.size===3);
  if([40,100,400,1599].includes(t)){while(replay.tick<s.tick)replay=stepEcology(replay);expect(s).toEqual(replay);}
 }
 expect(s.lineage.length).toBeGreaterThan(8);expect(s.lineage.some(l=>l.mutated)).toBe(true);expect(s.lineage.some(l=>l.died!==null)).toBe(true);expect(grew).toBe(true);expect(s.lineage.length).toBeLessThanOrEqual(256);expect(s.events.length).toBeLessThanOrEqual(40);expect(()=>stepEcology(s)).toThrow('complete');
});
it('leaves primordial organism-free without mislabeling food replenishment as emergence',()=>{
 let s=initializeEcology(validateEcology({...definition,mode:'primordial'}));for(let i=0;i<20;i++)s=stepEcology(s);
 expect(s.creatures).toEqual([]);expect(s.lineage).toEqual([]);expect(s.sunlight).toBeGreaterThan(0);expect(ecologyMetrics(s).births).toBe(0);
});
it('rejects incompatible, coercible or oversized definitions',()=>{
 expect(parseEcology(JSON.stringify(definition))).toEqual(definition);
 for(const d of [{...definition,seed:'42'},{...definition,version:2},{...definition,extra:1},{...definition,mode:'random'},{...definition,seed:NaN}])expect(()=>validateEcology(d)).toThrow();
 expect(()=>parseEcology(' '.repeat(65537))).toThrow('64 KiB');
});

it('funds no hidden energy when an organism dies from age',()=>{
 const s=initializeEcology(definition);s.creatures[0]!.age=s.creatures[0]!.genes.lifespan-1;const next=stepEcology(s);
 expect(next.lineage[0]!.died).toBe(1);expect(next.creatures.some(c=>c.id===1)).toBe(false);expect(ecologyMetrics(next).accounted).toBe(ecologyMetrics(next).supplied);
});
