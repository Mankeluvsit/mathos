import { ORGAN_COLORS as colors } from '../rendering/organ-colors';
import type { Layout } from '../ecology/body-genome';
import type { World } from '../ecology/genome-model';

const marks = { body: 'B', mouth: 'M', motor: 'T', sensor: 'S' };
/** Compare the ordered inherited program, including position, role and growth order. */
function changedLoci(before: Layout, after: Layout): number[] {
  return Array.from({ length: Math.max(before.length, after.length) }, (_, i) => i)
    .filter(i => before[i]?.x !== after[i]?.x || before[i]?.y !== after[i]?.y || before[i]?.role !== after[i]?.role);
}
function Blueprint({ layout, other, changed, label }: { layout: Layout; other: Layout; changed: number[]; label: string }) {
  const missing = other.filter(p => !layout.some(q => q.x === p.x && q.y === p.y));
  return <svg className="inheritance-blueprint" viewBox="0 0 120 120" role="img" aria-label={label}>
    <title>{label}</title>
    {Array.from({ length: 25 }, (_, i) => <rect key={i} x={i % 5 * 24 + 1} y={Math.floor(i / 5) * 24 + 1} width="22" height="22" fill="#0a1512" />)}
    {missing.map(p => <g key={`${p.x},${p.y}`}><rect x={(p.x + 2) * 24 + 2} y={(p.y + 2) * 24 + 2} width="20" height="20" fill="none" stroke="#bac9d9" strokeDasharray="3 2" /><path d={`M${(p.x + 2) * 24 + 8},${(p.y + 2) * 24 + 8}l8,8m0,-8l-8,8`} stroke="#bac9d9" /></g>)}
    {layout.map((p, i) => <g key={i}>
      <rect x={(p.x + 2) * 24 + 2} y={(p.y + 2) * 24 + 2} width="20" height="20" fill={colors[p.role]} stroke={changed.includes(i) ? '#fff' : '#31483a'} strokeWidth={changed.includes(i) ? 3 : 1} />
      <text x={(p.x + 2) * 24 + 12} y={(p.y + 2) * 24 + 16} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#08130c">{marks[p.role]}</text>
    </g>)}
  </svg>;
}
export function InheritanceComparison({ world, selected }: { world: Pick<World, 'lineage'>; selected: number }) {
  const child = world.lineage.find(l => l.id === selected);
  if (!child || child.parent === null) return null;
  const parent = world.lineage.find(l => l.id === child.parent);
  if (!parent) return <section className="inheritance-comparison" aria-label="Parent and offspring comparison"><h4>What changed from its parent?</h4><p>Parent #{child.parent} is unavailable in this bounded archive. No comparison can be drawn.</p></section>;
  const before = parent.genes.layout, after = child.genes.layout, changed = changedLoci(before, after);
  const point = (p: Layout[number]) => `${p.role} (${p.x}, ${p.y})`;
  return <section className="inheritance-comparison" aria-label="Parent and offspring comparison">
    <h4>What changed from its parent?</h4>
    <p>Born at step {child.born} · generation {child.generation} · family #{child.family}</p>
    <div className="inheritance-pair">
      <figure><figcaption>Parent #{parent.id}<small>{before.length}-cell blueprint</small></figcaption><Blueprint layout={before} other={after} changed={changed} label={`Parent #${parent.id} inherited blueprint, ${before.length} cells; north faces up`} /></figure>
      <figure><figcaption>Offspring #{child.id}<small>{after.length}-cell blueprint</small></figcaption><Blueprint layout={after} other={before} changed={changed} label={`Offspring #${child.id} inherited blueprint, ${after.length} cells; north faces up`} /></figure>
    </div>
    <p className="hint">North ↑ in both blueprints. White borders mark changed growth slots; a dashed × marks a position present only in the other blueprint. These show inherited targets, not current grown bodies.</p>
    {changed.length ? <ul className="inheritance-differences">{changed.map(i => <li key={i}>Growth slot {i + 1}: {before[i] ? point(before[i]!) : 'absent'} → {after[i] ? point(after[i]!) : 'absent'}.</li>)}</ul> : <p>Same inherited body layout. Growing or turning does not change this blueprint.</p>}
    <p className="hint">B body · M mouth · T motor · S sensor. An inherited change is not proof of improvement. Learning changes decisions during life; offspring start with fresh controller weights.</p>
  </section>;
}

export function RecentInheritedChanges({ world, inspect }: { world: Pick<World, 'lineage'>; inspect?: (id: number) => void }) {
  return <section className="inheritance-recent" aria-label="Recorded inherited body changes">
        <h3>Recent inherited body changes</h3>
        <p className="hint">Actual accepted changes at birth, newest first. Growth and learning are separate. Showing at most six records from this run.</p>
        {world.lineage.some(l => l.layoutMutation) ? <ol>{world.lineage.filter(l => l.layoutMutation).slice(-6).reverse().map(child => {
          const parent = world.lineage.find(l => l.id === child.parent);
          const operation = child.layoutMutation.split(':')[0];
          const change = operation === 'add' ? 'Added organ' : operation === 'remove-last' ? 'Removed organ' : operation === 'change-role' ? 'Changed organ role' : operation === 'relocate' ? 'Moved organ' : 'Changed blueprint';
          return <li key={child.id}>
            <strong>#{child.parent} → #{child.id}</strong><span>Step {child.born} · generation {child.generation} · family #{child.family}</span>
            <span>{change} · {parent ? `${parent.genes.layout.length} → ${child.genes.layout.length} inherited cells` : 'Parent blueprint unavailable'} · {child.died === null ? 'alive' : `died at step ${child.died}`}</span>
            {inspect && <button onClick={() => inspect(child.id)} aria-label={`Compare body change for organism ${child.id}`}>Compare parent & offspring</button>}
          </li>;
        })}</ol> : <p>No inherited body change recorded yet. Births can copy the same layout; a growing body is not a new mutation.</p>}
  </section>;
}
