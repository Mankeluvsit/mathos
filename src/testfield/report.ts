import {canonicalState, metrics, replay, TestSession} from './session.ts';
export type Digest=(text:string)=>Promise<string>;
export const sha256:Digest=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(b=>b.toString(16).padStart(2,'0')).join('');
export interface Context {source:{revision:string;dirty:boolean};browser:string;viewport:{width:number;height:number};}
export async function makeReport(session:TestSession,context:Context,running:boolean,notes:string,digest:Digest=sha256){
  const world=session.snapshot(),recipe=session.recipe();
  return {format:'mathos-test-report' as const,version:1 as const,engine:'test-field-reference@1' as const,
    bodyGenome:'cell-layout@1',controller:'linear-td@1',rng:'mulberry32@1',streams:'ecology-streams@1',
    ...context,browser:context.browser.slice(0,300),...recipe,
    status:recipe.failure?'error':session.complete?'completed':running?'running':'paused',
    edited:recipe.edits.length>0,requestedSteps:world.definition.test.steps,
    finalHash:await digest(canonicalState(world)),metrics:metrics(world),history:world.history.map(s=>({...s})),notes:notes.slice(0,2000)};
}
export type TestReport=Awaited<ReturnType<typeof makeReport>>;
export function reportText(r:TestReport):string {
  return `MATHOS TEST REPORT\n${r.initial.name} — ${r.status}${r.edited?' · edited test':''}\n`+
    `Engine: ${r.engine}; steps ${r.tick}/${r.requestedSteps}; seed ${r.initial.seed}\n`+
    `Population ${r.metrics.population}; births ${r.metrics.births}; deaths ${r.metrics.deaths}; user removals ${r.metrics.removed}\n`+
    `Food intake ${r.metrics.intake}; moves ${r.metrics.moves}; turns ${r.metrics.turns}; learning updates ${r.metrics.updates}\n`+
    `Accepted body changes ${r.metrics.acceptedChanges}; largest developed body ${r.metrics.maxDeveloped}\n`+
    `Resources: ${r.metrics.supplied} supplied / ${r.metrics.accounted} accounted — ${r.metrics.exact?'exact':'FAILED'}\n`+
    `Author edits ${r.edits.length}; undone edits ${r.undoCount}; recorded errors ${r.errors.length}\n`+
    `My observations: ${r.notes||'(none added)'}\n`+
    `Replay recipe and final-state fingerprint follow. This is not a checkpoint or proof of improved learning.\n\n`+
    '```json\n'+JSON.stringify(r,null,2)+'\n```\n';
}
export function parseReport(text:string):unknown {
  if(new TextEncoder().encode(text).length>1048576)throw Error('Report exceeds1MiB.');
  const fenced=text.match(/```json\s*\n([\s\S]*?)\n```/);
  return JSON.parse(fenced?fenced[1]!:text);
}
export async function verifyReport(input:unknown,digest:Digest=sha256){
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Expected a test report.');
  const r=input as TestReport;
  if(r.format!=='mathos-test-report'||r.version!==1||r.engine!=='test-field-reference@1'||r.bodyGenome!=='cell-layout@1'||
    r.controller!=='linear-td@1'||r.rng!=='mulberry32@1'||r.streams!=='ecology-streams@1'||typeof r.finalHash!=='string'||!/^[0-9a-f]{64}$/.test(r.finalHash))throw Error('Unsupported test report.');
  const world=replay(r.initial,r.edits,r.tick),actual=metrics(world);
  if(await digest(canonicalState(world))!==r.finalHash)throw Error('Final scientific state does not match the report.');
  if(!r.metrics||Object.keys(r.metrics).length!==Object.keys(actual).length||
    Object.entries(actual).some(([key,value])=>r.metrics[key as keyof typeof actual]!==value)||
    JSON.stringify(world.history)!==JSON.stringify(r.history)||world.definition.test.steps!==r.requestedSteps)throw Error('Reported analytics do not match replay.');
  if(r.tick>world.definition.test.steps||r.edited!==(r.edits.length>0)||
    (r.status==='completed')!==(r.tick===world.definition.test.steps)||!['completed','paused','running','error'].includes(r.status))throw Error('Reported completion status is inconsistent.');
  return {world,metrics:actual,hash:r.finalHash};
}
