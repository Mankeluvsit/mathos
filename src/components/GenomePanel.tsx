import {forwardCost,roleCounts} from '../ecology/body-genome';
import type {World} from '../ecology/genome-model';
const marks={body:'B',mouth:'M',motor:'T',sensor:'S'};
function changeStory(world:World, selected:number):string {
 const record=world.lineage.find(l=>l.id===selected);
 if(!record||record.parent===null)return 'Authored founder blueprint.';
 if(!record.layoutMutation)return 'Inherited the parent’s layout without a structural change.';
 const parent=world.lineage.find(l=>l.id===record.parent);
 if(!parent)return 'Inherited a changed body layout; parent details are unavailable.';
 const before=parent.genes.layout,after=record.genes.layout;
 const point=(p:{x:number;y:number})=>`(${p.x},${p.y})`;
 if(after.length>before.length){const p=after.at(-1)!;return `Added a ${p.role} at ${point(p)}.`;}
 if(after.length<before.length){const p=before.at(-1)!;return `Removed the ${p.role} at ${point(p)}.`;}
 const i=after.findIndex((p,i)=>p.x!==before[i]!.x||p.y!==before[i]!.y||p.role!==before[i]!.role);
 if(i<0)return 'No difference in the recorded layouts.';
 const a=before[i]!,b=after[i]!;
 return a.role!==b.role?`Changed a ${a.role} into a ${b.role} at ${point(b)}.`:`The ${b.role} moved from ${point(a)} to ${point(b)}.`;
}
export function GenomePanel({world,selected}:{world:World;selected:number}){
 const live=world.creatures.find(c=>c.id===selected),record=world.lineage.find(l=>l.id===selected);
 if(!record)return null;
 const genes=live?.genes??record.genes,developed=live?.size??record.developed;
 const pose={x:0,y:0,direction:0,size:developed,genes},counts=roleCounts(pose);
 return <section className="genome-inspector" aria-labelledby="genome-title">
  <h3 id="genome-title">Inherited body blueprint</h3>
  <p data-testid="genome-development"><strong>{developed} of {genes.layout.length} cells developed</strong>{live?'':' at last observation'}. Cells grow in inherited order when space and energy allow.</p>
  <div className="genome-blueprint" role="img" aria-label={`Inherited north-facing blueprint, ${genes.layout.length} cells; ${developed} developed. Exact coordinates and roles follow in the blueprint table.`}>
   {genes.layout.map((p,i)=><span key={i} className={`${p.role}-cell ${i<developed?'developed':'undeveloped'}`} style={{gridColumn:p.x+3,gridRow:p.y+3}}>{marks[p.role]}</span>)}
  </div>
  <p className="hint">Blueprint faces north; the world shows the actual heading. Solid cells are grown; dashed cells are waiting. B core · M mouth · T motor · S sensor.</p>
  <p data-testid="genome-functions">Developed: {counts.mouth} mouths · {counts.motor} motors · {counts.sensor} sensors. Upkeep: {developed}/step. {counts.motor?`Forward move: ${forwardCost(pose)} energy.`:'Movement waits for a motor.'} Each new cell takes8 energy.</p>
  <p className="hint">Extra mouths collect food; sensors extend forward sensing; extra motors reduce movement cost. Larger bodies cost more upkeep. Founding template: {genes.bodyPlan}; the genome above determines its actual body.</p>
  <details><summary>Exact inherited blueprint</summary><div className="life-table-scroll"><table><thead><tr><th>Order</th><th>x</th><th>y</th><th>Role</th><th>Developed</th></tr></thead><tbody>
   {genes.layout.map((p,i)=><tr key={i}><td>{i+1}</td><td>{p.x}</td><td>{p.y}</td><td>{p.role}</td><td>{i<developed?'Yes':'Not yet'}</td></tr>)}
  </tbody></table></div></details>
  <details><summary>Body inheritance at birth</summary>
   <p data-testid="genome-birth">{changeStory(world,selected)}</p>
   {record.layoutMutation&&<details><summary>Exact birth genome change</summary><p className="hint">{record.layoutMutation}</p></details>}
   {record.layoutAttempt&&<p>Structural proposal: {record.layoutAttempt}.</p>}
   <p className="hint">A rejected proposal is not a mutation. Layout changes happen at birth; growing a cell develops the inherited layout. Learned weights are reset in children.</p>
  </details>
 </section>;
}
