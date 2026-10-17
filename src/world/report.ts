import {canonicalState,metrics,replay,decodeCheckpoint,TestSession} from './session.ts';
import {initialize} from './engine.ts';
import {validateConfig} from './config.ts';
import {sha256,type Digest,type Context} from '../testfield/report.ts';
export async function makeReport(session:TestSession,context:Context,running:boolean,notes:string,digest:Digest=sha256){
 const world=session.snapshot(),recipe=session.recipe();
 const scope=recipe.checkpoint.tick===0&&recipe.checkpoint.editsApplied===0?'from-genesis':'latest-segment';
 return {format:'mathos-world-report' as const,version:1 as const,engine:'mathos-world@1' as const,controller:'linear-td@1',streams:'world-streams@1',bodyGenome:'cell-layout@1',rng:'mulberry32@1',...context,browser:context.browser.slice(0,300),...recipe,scope,
 status:recipe.failure?'error':session.complete?'completed':running?'running':'paused',edited:world.editsApplied>0,requestedSteps:world.definition.test.steps,
 finalHash:await digest(canonicalState(world)),metrics:metrics(world),history:world.history.map(s=>({...s})),notes:notes.slice(0,2000)};
}
export type TestReport=Awaited<ReturnType<typeof makeReport>>;
export function reportText(r:TestReport){return `MATHOS WORLD REPORT\n${r.initial.name} — ${r.status}\nStep ${r.tick}; stop ${r.requestedSteps??'until paused'}; seed ${r.initial.seed}\nPopulation ${r.metrics.population}; births ${r.metrics.births}; deaths ${r.metrics.deaths}; learning updates ${r.metrics.updates}\nResources ${r.metrics.supplied}/${r.metrics.accounted}: ${r.metrics.exact?'exact':'FAILED'}\nReplay scope: ${r.scope}, boundary ${r.checkpoint.tick} through ${r.tick}. Earlier history is summarized, not independently replay-verified by this segment.\nMy observations: ${r.notes||'(none)'}\n\n\`\`\`json\n${JSON.stringify(r,null,2)}\n\`\`\`\n`;}
export {parseReport} from '../testfield/report.ts';
export async function verifyReport(input:unknown,digest:Digest=sha256){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Expected a world report.');const r=input as TestReport;
 if(r.format!=='mathos-world-report'||r.version!==1||r.engine!=='mathos-world@1'||r.controller!=='linear-td@1'||r.streams!=='world-streams@1'||r.bodyGenome!=='cell-layout@1'||r.rng!=='mulberry32@1'||typeof r.finalHash!=='string'||!/^[0-9a-f]{64}$/.test(r.finalHash))throw Error('Unsupported world report.');
 const initial=validateConfig(r.initial),base=decodeCheckpoint(r.checkpoint),scope=base.tick===0&&base.editsApplied===0?'from-genesis':'latest-segment';
 if(r.scope!==scope||(scope==='from-genesis'&&canonicalState(initialize(initial))!==canonicalState(base)))throw Error('Checkpoint origin does not match the report.');
 const world=replay(r.checkpoint,r.edits,r.tick),actual=metrics(world),hash=await digest(canonicalState(world));
 if(hash!==r.finalHash)throw Error('Final scientific state does not match the report.');
 if(!r.metrics||Object.keys(r.metrics).length!==Object.keys(actual).length||Object.entries(actual).some(([k,v])=>r.metrics[k as keyof typeof actual]!==v)||JSON.stringify(world.history)!==JSON.stringify(r.history)||r.requestedSteps!==world.definition.test.steps)throw Error('Reported analytics do not match replay.');
 const complete=world.definition.test.steps!==null&&world.tick===world.definition.test.steps;
 if((world.definition.test.steps!==null&&world.tick>world.definition.test.steps)||r.edited!==(world.editsApplied>0)||(r.status==='completed')!==complete||!['completed','paused','running','error'].includes(r.status))throw Error('Reported status is inconsistent.');
 return {world,metrics:actual,hash,scope};
}
