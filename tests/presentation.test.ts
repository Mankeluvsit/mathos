import {expect,it} from 'vitest';
import {PRESENTATION as t,PRESENTATION_STYLE} from '../src/design/presentation';
import {ORGAN_COLORS} from '../src/rendering/organ-colors';
function luminance(hex:string){
 const c=hex.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
 return .2126*c[0]!+.7152*c[1]!+.0722*c[2]!;
}
function contrast(a:string,b:string){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
it('keeps semantic foreground/background pairs readable and world roles distinct from selection',()=>{
 const ui=t.interface;
 for(const background of [ui.canvas,ui.surface,ui.surfaceRaised,ui.surfaceActive]){
  for(const foreground of [ui.text,ui.muted,ui.primary,ui.warning,ui.error])expect(contrast(foreground,background)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(ui.outline,background)).toBeGreaterThanOrEqual(3);
 }
 expect(contrast(ui.onPrimary,ui.primary)).toBeGreaterThanOrEqual(4.5);
 expect(ORGAN_COLORS).toEqual(t.world.organs);
 expect(new Set([...Object.values(ORGAN_COLORS),t.world.selection]).size).toBe(5);
 expect(PRESENTATION_STYLE).toHaveProperty('--mathos-surface-raised',ui.surfaceRaised);
});
