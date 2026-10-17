import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InheritanceComparison, RecentInheritedChanges } from '../src/components/InheritanceComparison';
import { initialize, step, type World } from '../src/ecology/genome-model';
import { founderLayout } from '../src/ecology/body-genome';

function example(tick = 63): World {
 let world = initialize({ format: 'mathos-ecology', version: 4, seed: 4294967295, mode: 'seeded', learning: true, structuralMutation: true });
 while (world.tick < tick) world = step(world);
 return world;
}
describe('read-only inherited body presentation', () => {
 it('compares an actual relocated mouth with its parent without changing scientific state', () => {
  const world = example(), before = JSON.stringify(world);
  render(<InheritanceComparison world={world} selected={9} />);
  const panel = screen.getByRole('region', { name: 'Parent and offspring comparison' });
  expect(within(panel).getByText(/mouth \(1, 0\) → mouth \(1, -1\)/)).toBeInTheDocument();
  expect(within(panel).getByRole('img', { name: /Offspring #9 inherited blueprint, 4 cells/ })).toBeInTheDocument();
  expect(within(panel).getByText(/inherited targets, not current grown bodies/)).toBeInTheDocument();
  expect(JSON.stringify(world)).toBe(before);
 });
 it('does not call normal development a mutation and retains dead birth comparisons', () => {
  const young = example(43), dead = example(114);
  const view = render(<InheritanceComparison world={young} selected={9} />);
  const story = screen.getByRole('region', { name: 'Parent and offspring comparison' }).textContent;
  expect(young.creatures.find(c=>c.id===9)?.size).toBe(2);
  view.rerender(<InheritanceComparison world={dead} selected={9} />);
  expect(dead.creatures.some(c=>c.id===9)).toBe(false);
  expect(screen.getByRole('region', { name: 'Parent and offspring comparison' }).textContent).toBe(story);
 });
 it('handles unchanged children and missing parent records without inventing anatomy', () => {
  const world = example();world.lineage.find(l=>l.id===9)!.genes.layout = world.lineage.find(l=>l.id===8)!.genes.layout;
  const view = render(<InheritanceComparison world={world} selected={9} />);
  expect(screen.getByText(/Same inherited body layout/)).toBeInTheDocument();
  world.lineage=world.lineage.filter(l=>l.id!==8);view.rerender(<InheritanceComparison world={world} selected={9} />);
  expect(screen.getByText(/No comparison can be drawn/)).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
 });
 it('shows added and removed growth slots explicitly, and does not compare authored founders', () => {
  const world = example();world.lineage.find(l=>l.id===8)!.genes.layout=founderLayout('dart');
  const view = render(<InheritanceComparison world={world} selected={9} />);
  expect(screen.getByText(/absent → mouth \(1, -1\)/)).toBeInTheDocument();
  world.lineage.find(l=>l.id===8)!.genes.layout=founderLayout('grazer');world.lineage.find(l=>l.id===9)!.genes.layout=founderLayout('dart');view.rerender(<InheritanceComparison world={world} selected={9} />);
  expect(screen.getByText(/mouth \(1, 0\) → absent/)).toBeInTheDocument();
  view.rerender(<InheritanceComparison world={world} selected={1} />);expect(screen.queryByRole('region')).not.toBeInTheDocument();
 });
 it('lists accepted births only and opens the selected offspring without advancing the world', () => {
  const world=example(), inspect=vi.fn(), before=JSON.stringify(world);
  render(<RecentInheritedChanges world={world} inspect={inspect} />);
  fireEvent.click(screen.getByRole('button',{name:'Compare body change for organism 9'}));
  expect(inspect).toHaveBeenCalledWith(9);expect(JSON.stringify(world)).toBe(before);
  expect(screen.getAllByRole('listitem').length).toBeLessThanOrEqual(6);
 });
 it('explains the empty state without promising an evolutionary improvement', () => {
  render(<RecentInheritedChanges world={example(0)} />);
  expect(screen.getByText(/No inherited body change recorded yet/)).toBeInTheDocument();
 });
});
