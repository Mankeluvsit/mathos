/** cell-layout@1. Bounded, prefix-connected north-facing development program. ADR0011. */
import { rotate, STEP, type BodyPlan, type Role } from './oriented-geometry.ts';
export interface Locus { x: number; y: number; role: Role }
export type Layout = readonly Readonly<Locus>[];
export interface Pose { x: number; y: number; direction: number; size: number; genes: { layout: Layout } }
const required: Layout = [{x:0,y:0,role:'body'},{x:0,y:-1,role:'mouth'},{x:0,y:1,role:'motor'}];
const optional = ['mouth','motor','sensor'] as const;
export function validateLayout(value: unknown): Layout {
  if(!Array.isArray(value)||value.length<3||value.length>6)throw Error('Genome must have3–6 loci.');
  const cells: Locus[]=[];
  for(const item of value) {
    if(!item||typeof item!=='object'||Array.isArray(item)||Object.keys(item).length!==3||
      !['x','y','role'].every(k=>Object.hasOwn(item,k))||!Number.isInteger(item.x)||!Number.isInteger(item.y)||
      Math.abs(item.x)>2||Math.abs(item.y)>2)throw Error('Invalid genome locus.');
    const i=cells.length;
    if(i<3 ? item.x!==required[i]!.x||item.y!==required[i]!.y||item.role!==required[i]!.role : !optional.some(r=>r===item.role))throw Error('Invalid required or optional organ.');
    if(cells.some(p=>p.x===item.x&&p.y===item.y)||
      (i>0&&!cells.some(p=>Math.abs(p.x-item.x)+Math.abs(p.y-item.y)===1)))throw Error('Genome must be unique and prefix-connected.');
    cells.push(Object.freeze({x:item.x,y:item.y,role:item.role}));
  }
  return Object.freeze(cells);
}
export function cloneLayout(layout: Layout): Layout {return layout.map(p=>({...p}));}
export function layoutKey(layout: Layout): string {return layout.map(p=>`${p.x},${p.y}:${p.role}`).join(';');}
export function founderLayout(tag: BodyPlan): Layout {
  return validateLayout([...required,...(tag==='dart'?[]:[{x:1,y:0,role:tag==='grazer'?'mouth':'sensor'}])]);
}
export function parts(c: Pose): Locus[] {
  return c.genes.layout.slice(0,c.size).map(p=>({...rotate(p.x,p.y,c.direction),role:p.role})).map(p=>({...p,x:p.x+c.x,y:p.y+c.y}));
}
export function fits(c: Pose, occupied: ReadonlySet<number>, width=64,height=48): boolean {
  return parts(c).every(p=>p.x>=0&&p.x<width&&p.y>=0&&p.y<height&&!occupied.has(p.y*width+p.x));
}
export function canTurn(c: Pose, direction: number,occupied: ReadonlySet<number>,width=64,height=48):boolean {
  if(![1,3].includes((direction-c.direction+4)%4))return false;
  const before=parts(c),after=parts({...c,direction});
  return before.every((a,i)=>{const b=after[i]!;
    for(let y=Math.min(a.y,b.y);y<=Math.max(a.y,b.y);y++)for(let x=Math.min(a.x,b.x);x<=Math.max(a.x,b.x);x++)
      if(x<0||x>=width||y<0||y>=height||occupied.has(y*width+x))return false;
    return true;
  });
}
export function roleCounts(c: Pose) {
  const counts={body:0,mouth:0,motor:0,sensor:0};
  for(const p of parts(c))counts[p.role]++;
  return counts;
}
export function forwardCost(c: Pose): number {return Math.max(1,2+Math.max(0,c.size-3)-(roleCounts(c).motor-1));}
export function mutationProposal(layout: Layout, word: number): {layout: Layout; attempt: string; mutation: string} {
  if(!Number.isInteger(word)||word<0||word>4294967295)throw Error('Mutation word must be uint32.');
  validateLayout(layout);
  const next=layout.map(p=>({...p})),operation=(word>>>4)%4;
  const name=['add','remove-last','change-role','relocate'][operation]!;
  if((operation===0&&next.length===6)||(operation!==0&&next.length===3))return {layout:cloneLayout(layout),attempt:`${name}: length limit`,mutation:''};
  const i=3+(word>>>8)%(next.length-3),d=STEP[(word>>>12)%4]!;
  if(operation===0){const p=next[(word>>>20)%next.length]!;next.push({x:p.x+d.x,y:p.y+d.y,role:optional[(word>>>16)%3]!});}
  else if(operation===1)next.pop();
  else if(operation===2){const p=next[i]!;p.role=optional[(optional.indexOf(p.role as typeof optional[number])+1+((word>>>18)&1))%3]!;}
  else {next[i]!.x+=d.x;next[i]!.y+=d.y;}
  try {
    const accepted=validateLayout(next),mutation=`${name}: ${layoutKey(layout)} → ${layoutKey(accepted)}`;
    return {layout:accepted,attempt:`${name}: accepted`,mutation};
  }catch{return {layout:cloneLayout(layout),attempt:`${name}: invalid bounds, overlap or disconnected prefix`,mutation:''};}
}
