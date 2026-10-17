import { layoutKey } from "../ecology/body-genome";
import { isGenome, isOriented, type Ecology } from "../ecology/world";
import type { Sample } from "../ecology/oriented-model";
import { exportObservations } from "../ecology/observations";
import { PLANS } from "../ecology/oriented-geometry";
function History({ rows, origins=false }: { rows: Sample[]; origins?:boolean }) {
  const lines = [
    { key: "population" as const, color: "#e0eaf6", label: "All organisms" },
    { key: "dart" as const, color: "#63c6ff", label: "Dart" },
    { key: "grazer" as const, color: "#f4b75f", label: "Grazer" },
    { key: "scout" as const, color: "#cf88e9", label: "Scout" },
  ];
  const maxTick = Math.max(20, rows.at(-1)?.tick ?? 20);
  return (
    <>
      <svg
        className="evolution-chart"
        viewBox="0 0 640 180"
        role="img"
        aria-label={`Measured population and ${origins?"founder-origin":"body-plan"} counts over time. The exact values are in the history table.`}
      >
        <line x1="28" y1="150" x2="630" y2="150" stroke="#55718f" />
        <line x1="28" y1="10" x2="28" y2="150" stroke="#55718f" />
        {[0, 24, 48].map((n) => (
          <text
            key={n}
            x="2"
            y={154 - (n / 48) * 140}
            fill="#a0b2c9"
            fontSize="10"
          >
            {n}
          </text>
        ))}
        {lines.map((l) => (
          <polyline
            key={l.key}
            fill="none"
            stroke={l.color}
            strokeWidth="2"
            points={rows
              .map(
                (r) =>
                  `${28 + (r.tick / maxTick) * 600},${150 - (r[l.key] / 48) * 140}`,
              )
              .join(" ")}
          />
        ))}
        <text x="28" y="173" fill="#a0b2c9" fontSize="10">
          Step 0
        </text>
        <text x="558" y="173" fill="#a0b2c9" fontSize="10">
          Step {maxTick}
        </text>
      </svg>
      <p className="hint">
        White: all organisms · blue: dart · amber: grazer · purple: scout. {origins && "These are founder origins, not current body layouts."}
        Samples every 20 steps; current counts may be newer.
      </p>
      <details>
        <summary>Exact population history ({rows.length} samples)</summary>
        <div className="life-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Alive</th>
                <th>Food spots</th>
                <th>Dart{origins?" origin":""}</th>
                <th>Grazer{origins?" origin":""}</th>
                <th>Scout{origins?" origin":""}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.tick}>
                  <td>{r.tick}</td>
                  <td>{r.population}</td>
                  <td>{r.pellets}</td>
                  <td>{r.dart}</td>
                  <td>{r.grazer}</td>
                  <td>{r.scout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
export function EvolutionPanel({ world, inspect }: { world: Ecology; inspect?: (id:number)=>void }) {
  if (!isOriented(world)) return null;
  function download() {
    if (!isOriented(world)) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(exportObservations(world), null, 2) + "\n"], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `mathos-ecology-observations.v${world.definition.version === 4 ? 3 : world.definition.version === 3 ? 2 : 1}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const families = world.lineage
    .filter((l) => l.parent === null)
    .map((root) => {
      const records = world.lineage.filter((l) => l.family === root.id);
      return {
        id: root.id,
        plan: root.genes.bodyPlan,
        alive: records.filter((l) => l.died === null).length,
        births: records.length - 1,
        deaths: records.filter((l) => l.died !== null).length,
        intake: records.reduce((n, l) => n + l.intake, 0),
      };
    });
  return (
    <section
      className="panel ecology-evolution"
      aria-labelledby="evolution-title"
    >
      <p className="eyebrow">WATCH INHERITANCE AND COMPETITION</p>
      <h2 id="evolution-title">Families & changing bodies</h2>
      <p>
        Different bodies have different costs and capabilities. These counts are
        observations from this run—not proof that one body plan is universally
        better.
      </p>
      {isGenome(world) && <p data-testid="genome-population">Living blueprints: {new Set(world.creatures.map(c=>layoutKey(c.genes.layout))).size}. Accepted structural births: {world.lineage.filter(l=>l.layoutMutation).length} of {world.lineage.filter(l=>l.layoutAttempt&&!l.layoutAttempt.includes("disabled")).length} enabled structural proposals. Current body sizes: {[...new Set(world.creatures.map(c=>c.size))].sort((a,b)=>a-b).join(' / ')||'none'}. Counts below group founding templates, not actual anatomy.</p>}
      {isGenome(world) && inspect && <button disabled={!world.lineage.some(l=>l.layoutMutation)} onClick={()=>{const latest=world.lineage.filter(l=>l.layoutMutation).at(-1);if(latest)inspect(latest.id);}}>Inspect latest body change</button>}
      <div className="ecology-stats">
        {PLANS.map((plan) => (
          <p key={plan}>
            <strong data-testid={`plan-${plan}`}>
              {world.creatures.filter((c) => c.genes.bodyPlan === plan).length}
            </strong>{" "}
            {plan}{isGenome(world)?" origin":""}
          </p>
        ))}
      </div>
      <p className="hint">
        {isGenome(world)&&"Founding templates only: "}Dart: three cells, lower cost. Grazer: an extra mouth, more possible
        intake. Scout: an extra sensor, longer forward sensing. Four-cell bodies
        cost more to maintain and move.
      </p>
      <History rows={world.history} origins={isGenome(world)} />
      <button onClick={download}>Export observations</button>
      <p className="hint">
        Includes these sampled metrics, history, versions and family records. It
        cannot resume the world.
      </p>
      <details>
        <summary>Founder family outcomes</summary>
        <div className="life-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Founder</th>
                <th>{isGenome(world)?"Founding template":"Starting plan"}</th>
                <th>Alive</th>
                <th>Births</th>
                <th>Deaths</th>
                <th>Food taken</th>
              </tr>
            </thead>
            <tbody>
              {families.map((f) => (
                <tr key={f.id}>
                  <td>#{f.id}</td>
                  <td>{f.plan}</td>
                  <td>{f.alive}</td>
                  <td>{f.births}</td>
                  <td>{f.deaths}</td>
                  <td>{f.intake}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <p className="hint">
        Families include all descendants. An inherited mutation may change a
        descendant's body plan. Food taken is measured intake, not a fitness
        score.
      </p>
    </section>
  );
}
