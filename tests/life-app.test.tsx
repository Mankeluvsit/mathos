import { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { LifeLab } from '../src/components/LifeLab';

it('survives StrictMode effect replay, isolates drafts and resets same-definition replacements', async () => {
  render(<StrictMode><LifeLab onExit={() => {}} /></StrictMode>);
  await Promise.resolve();
  fireEvent.click(screen.getByRole('button', { name: 'Step life' }));
  expect(screen.getByTestId('life-tick')).toHaveTextContent('1');
  fireEvent.change(screen.getByLabelText('Life seed'), { target: { value: '123' } });
  expect(screen.getByTestId('life-tick')).toHaveTextContent('1');
  vi.spyOn(window, 'confirm').mockReturnValue(false);
  fireEvent.click(screen.getByRole('button', { name: 'Prepare life from draft' }));
  expect(screen.getByTestId('life-tick')).toHaveTextContent('1');
  vi.mocked(window.confirm).mockReturnValue(true);
  fireEvent.click(screen.getByRole('button', { name: 'Prepare life from draft' }));
  expect(screen.getByTestId('life-tick')).toHaveTextContent('0');
  fireEvent.click(screen.getByRole('button', { name: 'Step life' }));
  fireEvent.click(screen.getByRole('button', { name: 'Prepare life from draft' }));
  expect(screen.getByTestId('life-tick')).toHaveTextContent('0');
});
it('preserves a valid run after corrupt storage/import and offers export on quota failure', async () => {
  render(<LifeLab onExit={() => {}} />);
  localStorage.setItem('mathos.life-run.v1', '{broken');
  fireEvent.click(screen.getByRole('button', { name: 'Load life saved' }));
  expect(screen.getByText('Invalid life JSON.')).toBeInTheDocument();
  expect(screen.getByTestId('life-population')).toHaveTextContent('1');
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('quota'); });
  fireEvent.click(screen.getByRole('button', { name: 'Save life draft' }));
  expect(screen.getByText(/Life storage is blocked or full/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Export active life definition' })).toBeEnabled();
  const file = new File(['bad'], 'bad.json'); Object.defineProperty(file, 'text', { value: async () => 'bad' });
  fireEvent.change(screen.getByLabelText('Life definition file'), { target: { files: [file] } });
  await waitFor(() => expect(screen.getByText('Invalid life JSON.')).toBeInTheDocument());
});
it('pauses when the document is hidden', () => {
  render(<LifeLab onExit={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Start life' }));
  expect(screen.getByTestId('life-status')).toHaveTextContent('running');
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  fireEvent(document, new Event('visibilitychange'));
  expect(screen.getByTestId('life-status')).toHaveTextContent('paused');
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
});
