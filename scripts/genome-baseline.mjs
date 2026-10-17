import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {initialize,step} from '../src/ecology/genome-model.ts';
import {ecologyMetrics} from '../src/ecology/world.ts';
import {layoutKey} from '../src/ecology/body-genome.ts';
import {BASELINE_SEEDS} from '../src/ecology/baseline.ts';
if(process.argv.length!==3)throw Error('Usage: node scripts/genome-baseline.mjs NEW_OUTPUT.json');
const source={revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dirty:Boolean(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim())},runs=[];
for(const seed of BASELINE_SEEDS)for(const structuralMutation of [false,true]){
 let world=initialize({format:'mathos-ecology',version:4,seed,mode:'seeded',learning:true,structuralMutation});let populationTicks=0;
 while(world.tick<1600){world=step(world);populationTicks+=world.creatures.length;}
 runs.push({definition:world.definition,metrics:ecologyMetrics(world),populationTicks,attempts:world.lineage.filter(l=>l.layoutAttempt&&!l.layoutAttempt.includes('disabled')).length,accepted:world.lineage.filter(l=>l.layoutMutation).length,maxGenome:Math.max(0,...world.lineage.map(l=>l.genes.layout.length)),maxDeveloped:Math.max(0,...world.lineage.map(l=>l.developed)),distinctBirthGenomes:new Set(world.lineage.map(l=>layoutKey(l.genes.layout))).size,changes:world.lineage.filter(l=>l.layoutMutation).map(l=>({id:l.id,born:l.born,mutation:l.layoutMutation,died:l.died}))});
}
mkdirSync(dirname(process.argv[2]),{recursive:true});writeFileSync(process.argv[2],JSON.stringify({format:'mathos-genome-baseline',version:1,engine:'ecology-reference@4',bodyGenome:'cell-layout@1',controller:'linear-td@1',source,runtime:process.version,runs},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(runs.map(r=>({seed:r.definition.seed,structuralMutation:r.definition.structuralMutation,survivors:r.metrics.population,births:r.metrics.births,attempts:r.attempts,accepted:r.accepted,maxGenome:r.maxGenome,maxDeveloped:r.maxDeveloped,exact:r.metrics.accounted===r.metrics.supplied})),null,2));
