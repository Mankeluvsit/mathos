import { ORGAN_COLORS } from './organ-colors';
/** Original MATHOS glyphs and event cues; Cogmind-inspired presentation only. */
import { cellParts, W, H, type Ecology } from '../ecology/world';
import { ECOLOGY_CELL } from './ecology-renderer';

export const TERMINAL_COLORS = {
  background: '#050907', grid: '#122018', food: '#65945a',
  ...ORGAN_COLORS,
  selection: '#e6f4df', silhouette: '#355441',
} as const;
export interface ActivityCue {
  kind: 'move' | 'turn' | 'feed' | 'birth' | 'learning';
  x: number;
  y: number;
}
export const MAX_ACTIVITY_CUES = 96;
export const ACTIVITY_MS = 180;

/** Derive cues from observations. No RNG, world mutation or invented intermediate poses. */
export function observedActivity(previous: Ecology | null, next: Ecology): ActivityCue[] {
  if (!previous || next.definition.version !== previous.definition.version ||
    next.definition.seed !== previous.definition.seed || next.definition.mode !== previous.definition.mode ||
    ('structuralMutation' in next.definition && 'structuralMutation' in previous.definition && next.definition.structuralMutation !== previous.definition.structuralMutation) ||
    next.tick <= previous.tick ||
    ('learning' in next.definition && 'learning' in previous.definition && next.definition.learning !== previous.definition.learning)) return [];
  const old = new Map(previous.creatures.map(c => [c.id, c]));
  const cues: ActivityCue[] = [];
  for (const c of next.creatures) {
    const before = old.get(c.id);
    if (!before) {
      // A living organism newly observed since the prior sampled tick.
      if (next.lineage.some(l => l.id === c.id && l.born > previous.tick)) cues.push({kind:'birth', x:c.x, y:c.y});
      continue;
    }
    if (next.tick === previous.tick + 1) {
      if (Math.abs(c.x-before.x)+Math.abs(c.y-before.y) === 1) cues.push({kind:'move',x:before.x,y:before.y});
      if (c.direction !== before.direction) cues.push({kind:'turn',x:c.x,y:c.y});
    }
    if ('intake' in c && 'intake' in before && c.intake > before.intake) cues.push({kind:'feed',x:c.x,y:c.y});
    if ('controller' in c && 'controller' in before && c.controller.updates > before.controller.updates && c.lastDecision?.changes.some(n => n !== 0)) {
      cues.push({kind:'learning',x:c.x,y:c.y});
    }
  }
  return cues.slice(-MAX_ACTIVITY_CUES);
}

function brackets(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, size: number) {
  ctx.beginPath();
  for (const [cx, cy, dx, dy] of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]) {
    ctx.moveTo(cx!,cy!+dy!*size); ctx.lineTo(cx!,cy!); ctx.lineTo(cx!+dx!*size,cy!);
  }
  ctx.stroke();
}

export function drawTerminalEcology(
  ctx: CanvasRenderingContext2D, world: Ecology, selected: number,
  cues: readonly ActivityCue[] = [], progress = 1,
) {
  const z=ECOLOGY_CELL, color=TERMINAL_COLORS;
  ctx.save();
  ctx.fillStyle=color.background; ctx.fillRect(0,0,W*z,H*z);
  ctx.fillStyle=color.grid;
  for (let y=0;y<H;y+=4) for (let x=0;x<W;x+=4) ctx.fillRect(x*z,y*z,1,1);
  for (let p=0;p<world.food.length;p++) if (world.food[p]) {
    const x=(p%W)*z+6,y=Math.floor(p/W)*z+6;
    ctx.fillStyle=color.food;
    ctx.fillRect(x-2,y,5,1); ctx.fillRect(x,y-2,1,5);
  }
  // Only a short, bounded overlay fades. Physical body positions remain exact.
  const remaining=Math.max(0,1-progress);
  ctx.globalAlpha=remaining*0.75;
  ctx.lineWidth=1;
  for (const cue of cues) {
    const x=(cue.x+.5)*z,y=(cue.y+.5)*z,r=8+progress*5;
    if (cue.kind==='move') {
      ctx.fillStyle=color.motor; ctx.fillRect(x-2,y-1,4,2);
    } else if (cue.kind==='birth') {
      ctx.strokeStyle=color.body; brackets(ctx,x-r,y-r,r*2,r*2,3);
    } else if (cue.kind==='feed') {
      ctx.fillStyle=color.mouth;
      ctx.fillRect(x+r,y-2,1,5); ctx.fillRect(x+r-2,y,5,1);
    } else if (cue.kind==='learning') {
      ctx.strokeStyle=color.sensor; ctx.beginPath();
      ctx.moveTo(x,y-r);ctx.lineTo(x+3,y-r-3);ctx.lineTo(x,y-r-6);ctx.lineTo(x-3,y-r-3);ctx.closePath();ctx.stroke();
    } else {
      ctx.strokeStyle=color.motor; brackets(ctx,x-r,y-r,2*r,2*r,2);
    }
  }
  ctx.globalAlpha=1;
  for (const c of world.creatures) {
    const parts=cellParts(c);
    const occupied=new Set(parts.map(p=>`${p.x},${p.y}`));
    for (const p of parts) {
      const x=p.x*z,y=p.y*z;
      ctx.fillStyle='#0d1811';ctx.fillRect(x+1,y+1,z-2,z-2);
      ctx.strokeStyle=c.id===selected ? '#718c6c' : color.silhouette;ctx.lineWidth=1;
      ctx.beginPath();
      if (!occupied.has(`${p.x},${p.y-1}`)) {ctx.moveTo(x+.5,y+.5);ctx.lineTo(x+z-.5,y+.5);}
      if (!occupied.has(`${p.x+1},${p.y}`)) {ctx.moveTo(x+z-.5,y+.5);ctx.lineTo(x+z-.5,y+z-.5);}
      if (!occupied.has(`${p.x},${p.y+1}`)) {ctx.moveTo(x+.5,y+z-.5);ctx.lineTo(x+z-.5,y+z-.5);}
      if (!occupied.has(`${p.x-1},${p.y}`)) {ctx.moveTo(x+.5,y+.5);ctx.lineTo(x+.5,y+z-.5);}
      ctx.stroke();
      ctx.save();ctx.translate(x+6,y+6);ctx.rotate(c.direction*Math.PI/2);
      ctx.fillStyle=color[p.role];ctx.strokeStyle=color[p.role];ctx.lineWidth=1;
      if (p.role==='body') {
        ctx.fillRect(-3,-3,6,1);ctx.fillRect(-3,2,6,1);ctx.fillRect(-3,-2,1,4);ctx.fillRect(2,-2,1,4);ctx.fillRect(-1,-1,2,2);
      } else if (p.role==='mouth') {
        ctx.beginPath();ctx.moveTo(-3,2);ctx.lineTo(0,-3);ctx.lineTo(3,2);ctx.stroke();ctx.fillRect(-1,1,2,2);
      } else if (p.role==='motor') {
        ctx.fillRect(-3,-2,6,2);ctx.fillRect(-2,1,1,3);ctx.fillRect(1,1,1,3);
      } else {
        ctx.fillRect(-3,-1,6,2);ctx.fillRect(-1,-3,2,6);
      }
      ctx.restore();
    }
    if (c.id===selected) {
      const minX=Math.min(...parts.map(p=>p.x))*z,minY=Math.min(...parts.map(p=>p.y))*z;
      const maxX=(Math.max(...parts.map(p=>p.x))+1)*z,maxY=(Math.max(...parts.map(p=>p.y))+1)*z;
      ctx.strokeStyle=color.selection;ctx.lineWidth=1;
      brackets(ctx,minX-2,minY-2,maxX-minX+4,maxY-minY+4,4);
      ctx.font='10px monospace';ctx.fillStyle=color.selection;
      ctx.fillText(`#${c.id}`,Math.max(1,minX),Math.max(10,minY-5));
    }
  }
  ctx.restore();
}
