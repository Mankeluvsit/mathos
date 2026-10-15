import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../src/app/App';
import { DEFAULT_EXPERIMENT, MAX_IMPORT_BYTES, serializeExperiment } from '../src/domain/experiment';
import { STORAGE_KEY } from '../src/storage/experiment-storage';

describe('configuration workflow', () => {
  it('offers labeled controls and explicit save/load without autosaving edits', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/Static 64 by 64/);
    const name = screen.getByRole('textbox', { name: 'Experiment name' });
    await user.clear(name);
    await user.type(name, 'Local experiment');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Save locally' }));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).name).toBe('Local experiment');
    await user.clear(name);
    await user.type(name, 'Unsaved draft');
    await user.click(screen.getByRole('button', { name: 'Load saved' }));
    expect(name).toHaveValue('Local experiment');
  });

  it('rejects invalid drafts without overwriting a previous save', async () => {
    const user = userEvent.setup();
    const saved = serializeExperiment(DEFAULT_EXPERIMENT);
    localStorage.setItem(STORAGE_KEY, saved);
    render(<App />);
    await user.clear(screen.getByRole('spinbutton', { name: 'Random seed' }));
    await user.click(screen.getByRole('button', { name: 'Save locally' }));
    expect(screen.getByRole('status')).toHaveTextContent('Random seed');
    expect(localStorage.getItem(STORAGE_KEY)).toBe(saved);
  });

  it('keeps the draft when saved data is corrupt or storage is inaccessible', async () => {
    const user = userEvent.setup();
    localStorage.setItem(STORAGE_KEY, '{broken');
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Load saved' }));
    expect(screen.getByRole('status')).toHaveTextContent('not valid JSON');
    expect(screen.getByRole('textbox', { name: 'Experiment name' })).toHaveValue('First universe');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    await user.click(screen.getByRole('button', { name: 'Save locally' }));
    expect(screen.getByRole('status')).toHaveTextContent('Export JSON');
  });

  it('imports a valid file into the draft without writing storage', async () => {
    render(<App />);
    const imported = { ...DEFAULT_EXPERIMENT, name: 'Imported world', genesis: { mode: 'seeded' } };
    const file = new File([JSON.stringify(imported)], 'experiment.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', { value: async () => JSON.stringify(imported) });
    fireEvent.change(screen.getByLabelText('Import configuration file'), { target: { files: [file] } });
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Experiment name' })).toHaveValue('Imported world'));
    expect(screen.getByRole('combobox')).toHaveValue('seeded');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('rejects oversized or incompatible imports without replacing the draft', async () => {
    render(<App />);
    const file = new File([''], 'large.json');
    const read = vi.fn();
    Object.defineProperties(file, { size: { value: MAX_IMPORT_BYTES + 1 }, text: { value: read } });
    const input = screen.getByLabelText('Import configuration file');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('64 KiB'));
    expect(read).not.toHaveBeenCalled();
    const incompatible = new File([''], 'future.json');
    Object.defineProperty(incompatible, 'text', { value: async () => JSON.stringify({ ...DEFAULT_EXPERIMENT, schemaVersion: 2 }) });
    fireEvent.change(input, { target: { files: [incompatible] } });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Unsupported'));
    expect(screen.getByRole('textbox', { name: 'Experiment name' })).toHaveValue('First universe');
  });

  it('exports validated JSON even when storage is unavailable', async () => {
    const user = userEvent.setup();
    let exported: Blob | undefined;
    const create = vi.fn((blob: Blob) => { exported = blob; return 'blob:mathos'; });
    vi.stubGlobal('URL', class extends URL {
      static createObjectURL = create;
      static revokeObjectURL = vi.fn();
    });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Export JSON' }));
    expect(exported?.type).toBe('application/json');
    expect(exported?.size).toBe(new Blob([serializeExperiment(DEFAULT_EXPERIMENT)]).size);
    expect(click).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('export requested');
    vi.unstubAllGlobals();
  });
});
