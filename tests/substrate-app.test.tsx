import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/app/App';
import example from '../examples/substrate-run.v1.json';
import { SUBSTRATE_KEY } from '../src/storage/substrate-storage';

afterEach(() => vi.unstubAllGlobals());
async function openLab() {
  const user = userEvent.setup(); const view = render(<App />);
  await user.click(screen.getByRole('button', { name: 'Open substrate lab' }));
  return { user, lab: within(screen.getByRole('region', { name: 'Substrate laboratory' })), unmount: view.unmount };
}
describe('substrate user workflow', () => {
  it('requires explicit preparation, starts paused and keeps the active definition separate from edits', async () => {
    const { user, lab } = await openLab();
    expect(lab.queryByTestId('tick')).not.toBeInTheDocument();
    await user.click(lab.getByRole('button', { name: 'Prepare substrate from draft' }));
    expect(lab.getByTestId('tick')).toHaveTextContent(/^0$/);
    await user.clear(screen.getByLabelText('Experiment name')); await user.type(screen.getByLabelText('Experiment name'), 'Other draft');
    expect(lab.getByRole('heading', { name: 'Active substrate: First universe' })).toBeInTheDocument();
    await user.click(lab.getByRole('button', { name: 'Step' }));
    expect(lab.getByTestId('tick')).toHaveTextContent(/^1$/);
  });
  it('confirms resets/replacements after progress and lets the user cancel', async () => {
    const { user, lab } = await openLab();
    await user.click(lab.getByRole('button', { name: 'Prepare substrate from draft' }));
    const initial = lab.getByTestId('pixel-value').textContent;
    await user.click(lab.getByRole('button', { name: 'Step' }));
    await user.click(lab.getByRole('button', { name: 'Reset substrate' }));
    expect(lab.getByRole('group', { name: 'Confirm discarding progress' })).toBeInTheDocument();
    expect(lab.getByRole('button', { name: 'Start' })).toBeDisabled();
    await user.click(lab.getByRole('button', { name: 'Keep current run' }));
    expect(lab.getByTestId('tick')).toHaveTextContent(/^1$/);
    await user.click(lab.getByRole('button', { name: 'Reset substrate' }));
    await user.click(lab.getByRole('button', { name: 'Discard progress and continue' }));
    expect(lab.getByTestId('tick')).toHaveTextContent(/^0$/); expect(lab.getByTestId('pixel-value')).toHaveTextContent(initial!);
  });
  it('imports run definitions only, keeps corrupt data intact, and uses a separate save slot', async () => {
    const { user, lab } = await openLab();
    const file = new File([''], 'run.json');
    Object.defineProperty(file, 'text', { value: async () => JSON.stringify(example) });
    fireEvent.change(lab.getByLabelText('Import substrate definition file'), { target: { files: [file] } });
    await waitFor(() => expect(lab.getByRole('heading', { name: 'Active substrate: Reference substrate' })).toBeInTheDocument());
    await user.click(lab.getByRole('button', { name: 'Save run definition' }));
    expect(JSON.parse(localStorage.getItem(SUBSTRATE_KEY)!).format).toBe('mathos-substrate-run');
    const saved = localStorage.getItem(SUBSTRATE_KEY);
    const bad = new File([''], 'bad.json'); Object.defineProperty(bad, 'text', { value: async () => '{broken' });
    fireEvent.change(lab.getByLabelText('Import substrate definition file'), { target: { files: [bad] } });
    await waitFor(() => expect(lab.getByText('Substrate definition is not valid JSON.')).toBeInTheDocument());
    expect(localStorage.getItem(SUBSTRATE_KEY)).toBe(saved); expect(lab.getByTestId('tick')).toHaveTextContent(/^0$/);
  });
  it('validates coordinates and reports blocked storage without losing a run', async () => {
    const { user, lab } = await openLab();
    await user.click(lab.getByRole('button', { name: 'Prepare substrate from draft' }));
    await user.clear(lab.getByRole('spinbutton', { name: 'Pixel x' }));
    expect(lab.getByTestId('pixel-value')).toHaveTextContent('Enter coordinates');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('quota'); });
    await user.click(lab.getByRole('button', { name: 'Save run definition' }));
    expect(lab.getByText(/storage is blocked or full/)).toBeInTheDocument();
    expect(lab.getByTestId('tick')).toHaveTextContent(/^0$/);
  });
  it('pauses when the tab is hidden and cancels scheduled work on unmount', async () => {
    const request = vi.fn(() => 1), cancel = vi.fn();
    vi.stubGlobal('requestAnimationFrame', request); vi.stubGlobal('cancelAnimationFrame', cancel);
    const { user, lab, unmount } = await openLab();
    await user.click(lab.getByRole('button', { name: 'Prepare substrate from draft' }));
    await user.click(lab.getByRole('button', { name: 'Start' }));
    expect(request).toHaveBeenCalled();
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
    expect(lab.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(lab.getByText('Run paused because this tab is hidden. Resume explicitly when ready.')).toBeInTheDocument(); expect(cancel).toHaveBeenCalled();
    await user.click(lab.getByRole('button', { name: 'Start' }));
    const before = cancel.mock.calls.length; unmount();
    expect(cancel.mock.calls.length).toBeGreaterThan(before);
  });
});
