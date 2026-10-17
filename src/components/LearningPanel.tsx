import type { World } from '../ecology/learning-model';

const actions = ['forward', 'right', 'back', 'left'];
const features = ['Bias', 'Food ahead', 'Food right', 'Food behind', 'Food left', 'Stored energy'];
export function LearningPanel({ world, selected }: { world: World; selected: number }) {
  const creature = world.creatures.find(c => c.id === selected);
  const ancestor = world.lineage.find(c => c.id === selected);
  const decision = creature?.lastDecision ?? ancestor?.lastDecision;
  return <section className="learning-inspector" aria-labelledby="learning-title">
    <h3 id="learning-title">Learning during life</h3>
    <p data-testid="learning-mode">{world.definition.learning ? 'Learning on — choices can change with experience.' : 'Learning off — weights stay fixed for comparison.'}</p>
    <p>Choices adjust using food gained minus movement and upkeep. Children start fresh from inherited traits.</p>
    {ancestor && <p>Learning updates: <strong data-testid="learning-updates">{creature?.controller.updates ?? ancestor.updates}</strong></p>}
    {decision ? <>
      <p data-testid="learning-decision">Step {decision.tick}: intended <strong>{actions[decision.relative]}</strong> · {decision.exploring ? 'exploring' : 'highest estimated value'}.<br />Actual action: {decision.actual}.</p>
      <p data-testid="learning-reward">Reward: <strong>{decision.reward}</strong> = food {decision.intake} − movement {decision.mechanicalCost} − upkeep {decision.upkeep}{decision.intake - decision.mechanicalCost - decision.upkeep !== decision.reward ? ' (limited to −32…32)' : ''}.</p>
      <p className="hint">{world.definition.learning ? `${decision.changes.filter(n => n !== 0).length} of 6 weights changed for this intent on that step.` : 'The outcome is measured, but no weights are updated.'} {decision.terminal ? 'Final transition: no future value was assumed.' : ''}</p>
      <details>
        <summary>See the inputs and actual weight changes</summary>
        <p>Raw food signals (forward / right / back / left): {decision.signals.join(' / ')}. Inputs below are scaled to 0–64. The back is blind.</p>
        <div className="life-table-scroll"><table>
          <thead><tr><th>Input</th><th>Value</th><th>Weight change</th></tr></thead>
          <tbody>{features.map((name, i) => <tr key={name}><th scope="row">{name}</th><td>{decision.input[i]}</td><td>{decision.changes[i]! > 0 ? '+' : ''}{decision.changes[i]}</td></tr>)}</tbody>
        </table></div>
        <p>Estimated value before: {decision.previousQ}. Next estimate: {decision.nextQ}. Update signal: {decision.delta}.</p>
      </details>
    </> : <p data-testid="learning-waiting">{creature?.size === 2 ? 'This juvenile must develop a motor before it can make a learning decision.' : ancestor ? 'Press One step to see the first measured decision.' : 'No organism is selected; primordial worlds contain resources only.'}</p>}
    {creature && <details><summary>Current controller weights</summary>
      <p>Four direction preferences, each using six inputs. Values are internal integer units, not probabilities.</p>
      <div className="life-table-scroll"><table><thead><tr><th>Intent</th>{features.map(f => <th key={f}>{f}</th>)}</tr></thead><tbody>
        {creature.controller.weights.map((row, i) => <tr key={i}><th scope="row">{actions[i]}</th>{row.map((w, j) => <td key={j}>{w}</td>)}</tr>)}
      </tbody></table></div>
    </details>}
    <p className="hint">Changing weights proves the mechanism is running. It does not by itself prove better survival.</p>
  </section>;
}
