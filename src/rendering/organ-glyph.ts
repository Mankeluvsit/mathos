import {ORGAN_COLORS} from './organ-colors';
import type {Role} from '../ecology/oriented-geometry';
export function drawOrganGlyph(ctx:CanvasRenderingContext2D,role:Role,direction:number,x:number,y:number,scale=1){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.rotate(direction*Math.PI/2);
      ctx.fillStyle=ORGAN_COLORS[role];ctx.strokeStyle=ORGAN_COLORS[role];ctx.lineWidth=1;
      if (role==='body') {
        ctx.fillRect(-3,-3,6,1);ctx.fillRect(-3,2,6,1);ctx.fillRect(-3,-2,1,4);ctx.fillRect(2,-2,1,4);ctx.fillRect(-1,-1,2,2);
      } else if (role==='mouth') {
        ctx.beginPath();ctx.moveTo(-3,2);ctx.lineTo(0,-3);ctx.lineTo(3,2);ctx.stroke();ctx.fillRect(-1,1,2,2);
      } else if (role==='motor') {
        ctx.fillRect(-3,-2,6,2);ctx.fillRect(-2,1,1,3);ctx.fillRect(1,1,1,3);
      } else {
        ctx.fillRect(-3,-1,6,2);ctx.fillRect(-1,-3,2,6);
      }
      ctx.restore();
}
