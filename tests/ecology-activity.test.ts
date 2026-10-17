import { expect, it } from 'vitest';
import { initialize, copy, step } from '../src/ecology/learning-model';
import { observedActivity, MAX_ACTIVITY_CUES } from '../src/rendering/ecology-terminal';

const definition = {format:'mathos-ecology',version:3,seed:42,mode:'seeded',learning:true} as const;

it('creates only cues supported by observed transitions without changing either snapshot', () => {
  const before=initialize(definition), next=step(before);
  const oldCopy=copy(before), nextCopy=copy(next);
  const cues=observedActivity(before,next);
  expect(cues.some(c=>c.kind==='learning')).toBe(true);
  for (const cue of cues.filter(c=>c.kind==='move')) {
    expect(before.creatures.some(c=>c.x===cue.x && c.y===cue.y)).toBe(true);
  }
  expect(before).toEqual(oldCopy);expect(next).toEqual(nextCopy);
});

it('does not invent initial, reset or cross-seed events', () => {
  const before=initialize(definition), next=step(before);
  expect(observedActivity(null,before)).toEqual([]);
  expect(observedActivity(next,before)).toEqual([]);
  expect(observedActivity(before,before)).toEqual([]);
  expect(observedActivity(before,initialize({...definition,seed:1}))).toEqual([]);
});

it('skips intermediate travel and turning cues when publications skip ticks', () => {
  const before=initialize(definition),next=step(step(step(before)));
  const cues=observedActivity(before,next);
  expect(cues.some(c=>c.kind==='move'||c.kind==='turn')).toBe(false);
  expect(cues.some(c=>c.kind==='learning')).toBe(true);
});

it('requires actual weight changes and keeps the frozen arm free of learning cues', () => {
  const before=initialize({...definition,learning:false});
  expect(observedActivity(before,step(before)).some(c=>c.kind==='learning')).toBe(false);
  const next=step(initialize(definition));
  for (const c of next.creatures) if (c.lastDecision) c.lastDecision.changes.fill(0);
  expect(observedActivity(initialize(definition),next).some(c=>c.kind==='learning')).toBe(false);
});

it('marks newly observed births only when a matching birth record exists', () => {
  let world=initialize(definition),birthCue=false;
  for (let i=0;i<100;i++) {
    const next=step(world);
    const births=observedActivity(world,next).filter(c=>c.kind==='birth');
    for (const cue of births) expect(next.creatures.some(c=>c.x===cue.x&&c.y===cue.y&&c.age===0)).toBe(true);
    birthCue ||= births.length>0;world=next;
  }
  expect(birthCue).toBe(true);
});

it('bounds the cue buffer under dense simultaneous observations', () => {
  const before=initialize(definition),next=copy(before);next.tick=1;
  before.creatures=Array.from({length:48},(_,i)=>({...before.creatures[0]!,id:i+1}));
  next.creatures=before.creatures.map(c=>({...c,x:c.x+1,direction:1,intake:1,
    controller:{...c.controller,updates:1},lastDecision:{...step(initialize(definition)).creatures[0]!.lastDecision!,changes:[1,0,0,0,0,0]}}));
  expect(observedActivity(before,next)).toHaveLength(MAX_ACTIVITY_CUES);
});
