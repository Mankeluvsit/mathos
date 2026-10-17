// Full-horizon regression captures from v4 production code, NOT an independent oracle.
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {initialize,step} from '../src/ecology/genome-model.ts';
import {ecologyMetrics} from '../src/ecology/world.ts';
const cases=[];
for(const seed of [0,42])for(const learning of [false,true])for(const structuralMutation of [false,true]){
 let s=initialize({format:'mathos-ecology',version:4,seed,mode:'seeded',learning,structuralMutation});const frames=[];
 for(let tick=0;tick<=1600;tick++){
  if([0,20,100,400,1600].includes(tick))frames.push({tick,sha256:createHash('sha256').update(JSON.stringify({...s,food:Array.from(s.food)})).digest('hex'),metrics:ecologyMetrics(s),acceptedStructural:s.lineage.filter(l=>l.layoutMutation).length});
  if(tick<1600)s=step(s);
 }
 cases.push({seed,learning,structuralMutation,frames});
}
const text=JSON.stringify({engine:'ecology-reference@4',bodyGenome:'cell-layout@1',provenance:'TypeScript production regression captures, not an independent world oracle',cases},null,2)+'\n';
const path=new URL('../tests/fixtures/ecology-v4.json',import.meta.url);
if(process.argv.includes('--write'))writeFileSync(path,text);else if(readFileSync(path,'utf8')!==text)throw Error('V4 ecology regression mismatch');else console.log('V4 ecology regression fixtures match');
