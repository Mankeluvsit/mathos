/** mulberry32-v1: all arithmetic/bit operations use explicit 32-bit semantics. */
export function nextRandom(state: number): { state: number; value: number } {
  const next = (state + 0x6D2B79F5) >>> 0;
  let t = Math.imul(next ^ (next >>> 15), next | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { state: next, value: (t ^ (t >>> 14)) >>> 0 };
}
