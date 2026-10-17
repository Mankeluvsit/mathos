import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseReport,verifyReport} from '../src/testfield/report.ts';
if(process.argv.length!==3)throw Error('Usage: node scripts/replay-test-report.mjs REPORT.json-or-txt');
if(statSync(process.argv[2]).size>1048576)throw Error('Report exceeds1MiB.');
const result=await verifyReport(parseReport(readFileSync(process.argv[2],'utf8')),async text=>createHash('sha256').update(text).digest('hex'));
console.log(JSON.stringify({replay:'matched',tick:result.world.tick,hash:result.hash,metrics:result.metrics},null,2));
