import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {requireNode} from './dev-tools.mjs';
import {evaluatePlan, evaluationContrasts, validateEvaluationPlan} from '../src/ecology/evaluation.ts';

requireNode();
if (process.argv.length !== 4) throw Error('Usage: node scripts/evaluate-ecology.mjs PLAN.json NEW_OUTPUT.json');
const [planPath, outputPath] = process.argv.slice(2);
if (existsSync(outputPath)) throw Error('Output already exists; choose a new evidence filename.');
if (statSync(planPath).size > 65536) throw Error('Evaluation plan exceeds64KiB.');
const rawPlan = readFileSync(planPath);
const plan = validateEvaluationPlan(JSON.parse(rawPlan.toString('utf8')));
const source = {revision: execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(),
  dirty: Boolean(execFileSync('git', ['status', '--porcelain'], {encoding: 'utf8'}).trim())};
if (source.dirty) throw Error('Commit or preserve unrelated work first: evaluation requires clean source.');
const hash = value => createHash('sha256').update(value).digest('hex');
const engineModuleHashes = Object.fromEntries(execFileSync('git', ['ls-files', 'src/ecology'], {encoding: 'utf8'})
  .trim().split('\n').filter(path => path.endsWith('.ts')).sort().map(path => [path, hash(readFileSync(path))]));
const controller = new AbortController();
const interrupt = () => controller.abort();
process.on('SIGINT', interrupt);
process.on('SIGTERM', interrupt);
let result;
try {
  result = await evaluatePlan(plan, controller.signal, (run, completed, total) => {
    console.log(JSON.stringify({completed, total, seed: run.definition.seed, learning: run.definition.learning,
      structuralMutation: run.definition.structuralMutation, status: run.status, ticks: run.ticks,
      survivors: run.metrics.population, acceptedChanges: run.acceptedChanges,
      exact: run.metrics.accounted === run.metrics.supplied}));
  }, () => new Promise(resolve => setImmediate(resolve)));
} finally {
  process.off('SIGINT', interrupt);
  process.off('SIGTERM', interrupt);
}
mkdirSync(dirname(outputPath), {recursive: true});
writeFileSync(outputPath, JSON.stringify({...result, source, runtime: process.version,
  planSha256: hash(rawPlan), engineModuleHashes, contrasts: evaluationContrasts(result)}, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({status: result.status, runs: result.runs.length, output: outputPath}));
if (result.status !== 'completed') process.exitCode = 1;
