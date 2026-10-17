import { describe, expect, it } from 'vitest';
import { inputs, initialWeights, choose, update, rewardFromOutcome } from '../src/ecology/learning-controller.ts';
const zero = () => Array.from({length:4},()=>Array(6).fill(0));
const obs = [64,0,0,0,0,0];
describe('experimental bounded learning controller', () => {
  it('quantizes food and energy deterministically',()=>expect(inputs([16,32,0,1024],600)).toEqual([64,1,2,0,64,64]));
  it('initializes inherited food and inertia weights',()=>{const w=initialWeights(3,2);expect(w[0]![0]).toBe(32);expect(w[2]![3]).toBe(768)});
  it('resolves ties to forward',()=>expect(choose(zero(),obs)).toBe(0));
  it('increments bias by four for reward +1',()=>expect(update(zero(),obs,0,1,obs).weights[0]![0]).toBe(4));
  it('decrements bias by four for reward -1',()=>expect(update(zero(),obs,0,-1,obs).weights[0]![0]).toBe(-4));
  it('does not change nonselected rows',()=>{const r=update(zero(),obs,1,1,obs);expect(r.weights[0]).toEqual(Array(6).fill(0));expect(r.weights[1]![0]).toBe(4)});
  it('leaves frozen weights unchanged',()=>{const w=zero();expect(update(w,obs,0,1,obs,false,false).weights).toEqual(w)});
  it('ignores next Q for terminal updates',()=>{const w=zero();w[0]![0]=64;expect(update(w,obs,0,1,obs,true).delta).toBe(192)});
  it('saturates weights at the bound',()=>{const w=zero();w[0]![0]=4096;expect(update(w,obs,0,32,obs).weights[0]![0]).toBe(4096)});
  it('rejects invalid energy and actions',()=>{expect(()=>inputs([1,2,3,4],601)).toThrow();expect(()=>update(zero(),obs,4,1,obs)).toThrow()});
  it('rewards actual net energy and clips outliers',()=>{expect(rewardFromOutcome(24,2,3)).toBe(19);expect(rewardFromOutcome(0,2,3)).toBe(-5);expect(rewardFromOutcome(600,0,0)).toBe(32);expect(()=>rewardFromOutcome(-1,0,0)).toThrow()});
  it('validates next observation even on death',()=>expect(()=>update(zero(),obs,0,1,[64],true)).toThrow());
  it('does not mutate the input matrix',()=>{const w=zero();update(w,obs,0,1,obs);expect(w[0]![0]).toBe(0)});
});
