import { parseSubstrateRun, serializeSubstrateRun, type SubstrateRun } from '../domain/substrate-run.ts';

export const SUBSTRATE_KEY = 'mathos.substrate-run.v1';
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;

export function saveSubstrate(storage: StoragePort, value: SubstrateRun) {
  const json = serializeSubstrateRun(value);
  try { storage.setItem(SUBSTRATE_KEY, json); }
  catch { throw new Error('Substrate storage is blocked or full. Export a definition to keep a copy.'); }
}
export function loadSubstrate(storage: StoragePort): SubstrateRun {
  let json: string | null;
  try { json = storage.getItem(SUBSTRATE_KEY); }
  catch { throw new Error('Substrate storage is unavailable. Import/export still works.'); }
  if (json === null) throw new Error('No substrate definition saved in this browser.');
  return parseSubstrateRun(json);
}
