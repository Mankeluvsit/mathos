import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_EXPERIMENT } from '../src/domain/experiment';
import { loadExperiment, saveExperiment, STORAGE_KEY } from '../src/storage/experiment-storage';

describe('local persistence', () => {
  it('saves and reloads a validated portable configuration', () => {
    saveExperiment(localStorage, DEFAULT_EXPERIMENT);
    expect(loadExperiment(localStorage)).toEqual(DEFAULT_EXPERIMENT);
  });

  it('does not overwrite stored data when validation fails', () => {
    saveExperiment(localStorage, DEFAULT_EXPERIMENT);
    const before = localStorage.getItem(STORAGE_KEY);
    expect(() => saveExperiment(localStorage, { ...DEFAULT_EXPERIMENT, seed: -1 })).toThrow();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
  });

  it('reports missing/corrupt values without changing storage', () => {
    expect(() => loadExperiment(localStorage)).toThrow('No configuration');
    localStorage.setItem(STORAGE_KEY, '{broken');
    expect(() => loadExperiment(localStorage)).toThrow('not valid JSON');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{broken');
  });

  it('reports blocked reads and quota failures while preserving data', () => {
    const storage = {
      getItem: vi.fn(() => { throw new Error('blocked'); }),
      setItem: vi.fn(() => { throw new Error('quota'); }),
    };
    expect(() => loadExperiment(storage)).toThrow('import or export');
    expect(() => saveExperiment(storage, DEFAULT_EXPERIMENT)).toThrow('Export JSON');
  });
});
