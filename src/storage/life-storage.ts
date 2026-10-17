import { parseLifeRun, serializeLifeRun, type LifeRun } from '../domain/life-run.ts';

export const LIFE_KEY = 'mathos.life-run.v1';
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;

export function saveLife(storage: StoragePort, value: LifeRun) {
  const json = serializeLifeRun(value);
  try { storage.setItem(LIFE_KEY, json); }
  catch { throw new Error('Life storage is blocked or full. Export a definition to keep a copy.'); }
}
export function loadLife(storage: StoragePort): LifeRun {
  let json: string | null;
  try { json = storage.getItem(LIFE_KEY); }
  catch { throw new Error('Life storage is unavailable. Import/export still works.'); }
  if (json === null) throw new Error('No life definition saved in this browser.');
  return parseLifeRun(json);
}
