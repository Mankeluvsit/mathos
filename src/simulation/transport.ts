import type { SubstrateRun } from '../domain/substrate-run.ts';

export function transport(old: Uint16Array, width: number, height: number, rules: SubstrateRun['rules']): Uint16Array {
  const deltas = new Int32Array(old.length);
  const transfer = (a: number, b: number) => {
    const flux = Math.trunc((old[a]! - old[b]!) / rules.transferDivisor);
    deltas[a] = deltas[a]! - flux; deltas[b] = deltas[b]! + flux;
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      // Right edge, then down edge, using only the previous field.
      if (x + 1 < width) transfer(i, i + 1);
      else if (rules.boundary === 'periodic') transfer(i, y * width);
      if (y + 1 < height) transfer(i, i + width);
      else if (rules.boundary === 'periodic') transfer(i, x);
    }
  }
  const next = new Uint16Array(old.length);
  for (let i = 0; i < old.length; i++) {
    const value = old[i]! + deltas[i]!;
    if (value < 0 || value > 65535) throw new Error('Field bounds invariant failed.');
    next[i] = value;
  }
  return next;
}
