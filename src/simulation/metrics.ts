export interface Metrics { readonly sum: number; readonly min: number; readonly max: number }

export function measure(field: Uint16Array): Metrics {
  let sum = 0, min = 65535, max = 0;
  for (const value of field) { sum += value; min = Math.min(min, value); max = Math.max(max, value); }
  return Object.freeze({ sum, min, max });
}
