import { parseExperiment, serializeExperiment, type Experiment } from '../domain/experiment';

export const STORAGE_KEY = 'mathos.experiment.v1';
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;

export function saveExperiment(storage: StoragePort, experiment: Experiment): void {
  const json = serializeExperiment(experiment);
  try { storage.setItem(STORAGE_KEY, json); }
  catch { throw new Error('Could not save locally. Storage may be blocked or full. Export JSON to keep a copy.'); }
}

export function loadExperiment(storage: StoragePort): Experiment {
  let json: string | null;
  try { json = storage.getItem(STORAGE_KEY); }
  catch { throw new Error('Could not access local storage. You can still import or export JSON.'); }
  if (json === null) throw new Error('No configuration has been saved in this browser.');
  return parseExperiment(json);
}
