import { parseEcology, validateEcology, type EcologyDefinition } from './model.ts';
const KEY='mathos.ecology.v1';
type Port=Pick<Storage,'getItem'|'setItem'>;
export function saveEcology(port:Port,d:EcologyDefinition){const text=JSON.stringify(validateEcology(d));try{port.setItem(KEY,text);}catch{throw Error('Browser storage is unavailable or full. Export your starting settings instead.');}}
export function loadEcology(port:Port){let text;try{text=port.getItem(KEY);}catch{throw Error('Browser storage is unavailable. You can still import or export.');}if(text===null)throw Error('No ecology settings saved yet.');return parseEcology(text);}
