/** Shared world configuration. Old test-field v1 files remain legacy replay inputs. */
export const PRESETS = ['neutral','feeding','growth','inheritance','empty'] as const;
export type Preset=typeof PRESETS[number];
export interface Configuration {
 format:'mathos-world';version:1;name:string;seed:number;
 world:{width:number;height:number};
 rules:{foodEnergy:number;spawnAttempts:number;upkeep:number;initialFood:number;replenishment:boolean;foodCap:number|null;supplyBudget:number|null};
 organisms:{startingEnergy:number;learning:boolean;structuralMutation:boolean;reproduction:boolean;traitMutation:boolean;inheritBody:boolean;inheritTraits:boolean;inheritWeights:boolean;bodyPlan:'dart'|'grazer'|'scout';count:number};
 test:{preset:Preset;steps:number|null};
}
function object(v:unknown,keys:string[],label:string):Record<string,unknown>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(v,k)))throw Error(`${label}: unexpected or missing fields.`);return v as Record<string,unknown>;}
function number(v:unknown,min:number,max:number,label:string):number{if(!Number.isSafeInteger(v)||(v as number)<min||(v as number)>max)throw Error(`${label}: expected a whole number from ${min} to ${max}.`);return v as number;}
function bool(v:unknown,label:string):boolean{if(typeof v!=='boolean')throw Error(`${label}: expected true or false.`);return v;}
function limit(v:unknown,max:number,label:string){return v===null?null:number(v,0,max,label);}
export function validateConfig(input:unknown):Configuration{
 const c=object(input,['format','version','name','seed','world','rules','organisms','test'],'Configuration');
 if(c.format!=='mathos-world'||c.version!==1)throw Error('Expected mathos-world version1; legacy files need their original replay engine.');
 if(typeof c.name!=='string'||!c.name.trim()||c.name.length>80)throw Error('Name must contain1–80 characters.');
 const w=object(c.world,['width','height'],'World'),r=object(c.rules,['foodEnergy','spawnAttempts','upkeep','initialFood','replenishment','foodCap','supplyBudget'],'Rules'),o=object(c.organisms,['startingEnergy','learning','structuralMutation','reproduction','traitMutation','inheritBody','inheritTraits','inheritWeights','bodyPlan','count'],'Organisms'),t=object(c.test,['preset','steps'],'Run');
 if(!PRESETS.includes(t.preset as Preset)||!['dart','grazer','scout'].includes(o.bodyPlan as string))throw Error('Unsupported scenario or body plan.');
 const width=number(w.width,16,64,'Width'),height=number(w.height,16,48,'Height');
 return Object.freeze({format:'mathos-world',version:1,name:c.name,seed:number(c.seed,0,0xffffffff,'Seed'),world:Object.freeze({width,height}),
 rules:Object.freeze({foodEnergy:number(r.foodEnergy,1,96,'Patch energy'),spawnAttempts:number(r.spawnAttempts,0,8,'Spawn attempts'),upkeep:number(r.upkeep,1,3,'Upkeep'),initialFood:number(r.initialFood,0,width*height,'Initial food target'),replenishment:bool(r.replenishment,'Replenishment'),foodCap:limit(r.foodCap,64*48*96,'Standing food energy cap'),supplyBudget:limit(r.supplyBudget,1000000000,'Replenishment budget')}),
 organisms:Object.freeze({startingEnergy:number(o.startingEnergy,40,300,'Starting energy'),learning:bool(o.learning,'Learning'),structuralMutation:bool(o.structuralMutation,'Body mutation'),reproduction:bool(o.reproduction,'Reproduction'),traitMutation:bool(o.traitMutation,'Trait mutation'),inheritBody:bool(o.inheritBody,'Body inheritance'),inheritTraits:bool(o.inheritTraits,'Trait inheritance'),inheritWeights:bool(o.inheritWeights,'Weight inheritance'),bodyPlan:o.bodyPlan as Configuration['organisms']['bodyPlan'],count:number(o.count,0,8,'Starting organisms')}),
 test:Object.freeze({preset:t.preset as Preset,steps:t.steps===null?null:number(t.steps,1,1000000000,'Stop step')})});
}
export function presetConfig(preset:Preset='neutral'):Configuration{return validateConfig({format:'mathos-world',version:1,name:preset==='neutral'?'Shared world':`${preset} demonstration`,seed:42,world:{width:32,height:24},rules:{foodEnergy:preset==='inheritance'?48:24,spawnAttempts:2,upkeep:1,initialFood:preset==='empty'?0:150,replenishment:true,foodCap:4096,supplyBudget:12000},organisms:{startingEnergy:preset==='inheritance'?300:preset==='growth'?240:120,learning:true,structuralMutation:preset==='inheritance',reproduction:true,traitMutation:true,inheritBody:true,inheritTraits:true,inheritWeights:false,bodyPlan:preset==='feeding'?'grazer':'dart',count:preset==='empty'?0:preset==='feeding'?1:preset==='growth'?2:4},test:{preset,steps:1600}});}
export function serializeConfig(c:Configuration){return JSON.stringify(validateConfig(c),null,2)+'\n';}
export function parseConfig(s:string){if(new TextEncoder().encode(s).length>65536)throw Error('Configuration exceeds64KiB.');return validateConfig(JSON.parse(s));}
export function needsRestart(a:Configuration,b:Configuration){return a.seed!==b.seed||a.world.width!==b.world.width||a.world.height!==b.world.height||a.test.preset!==b.test.preset||a.rules.initialFood!==b.rules.initialFood||a.organisms.count!==b.organisms.count||a.organisms.bodyPlan!==b.organisms.bodyPlan;}
export const PRESET_HELP:Record<Preset,string>={neutral:'Common starting bodies and energy, balanced headings, seeded environmental food and no individual food gifts. Reproducible does not mean proven unbiased; compare multiple seeds.',feeding:'Authored feeding demonstration: food beside mouths. Not a neutral comparison.',growth:'Authored juvenile-growth demonstration: food beside mouths. Not a neutral comparison.',inheritance:'Authored reproduction demonstration: extra starting energy and body mutation enabled. Not a neutral comparison.',empty:'Empty starting field. Turn on testing tools to author a trial; additions are recorded as interventions.'};
