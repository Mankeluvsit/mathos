export const PRESETS = ['feeding', 'growth', 'inheritance', 'empty'] as const;
export type Preset = typeof PRESETS[number];
export interface Configuration {
  format: 'mathos-test-field';
  version: 1;
  name: string;
  seed: number;
  world: {width: number; height: number};
  rules: {foodEnergy: number; sunlight: number; upkeep: number};
  organisms: {startingEnergy: number; learning: boolean; structuralMutation: boolean};
  test: {preset: Preset; steps: number};
}
function record(value: unknown, keys: string[], label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).length !== keys.length || keys.some(k => !Object.hasOwn(value, k))) throw Error(`${label}: unexpected or missing fields.`);
  return value as Record<string, unknown>;
}
function integer(value: unknown, min: number, max: number, label: string): number {
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) throw Error(`${label} must be a whole number from ${min} to ${max}.`);
  return value as number;
}
function boolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') throw Error(`${label} must be true or false.`);
  return value;
}
export function validateConfig(input: unknown): Configuration {
  const c = record(input, ['format','version','name','seed','world','rules','organisms','test'], 'Configuration');
  if (c.format !== 'mathos-test-field' || c.version !== 1) throw Error('Expected mathos-test-field version1.');
  if (typeof c.name !== 'string' || !c.name.trim() || c.name.length > 80) throw Error('Name must contain1–80 characters.');
  const w = record(c.world, ['width','height'], 'World'), r = record(c.rules, ['foodEnergy','sunlight','upkeep'], 'Rules');
  const o = record(c.organisms, ['startingEnergy','learning','structuralMutation'], 'Organisms');
  const t = record(c.test, ['preset','steps'], 'Test');
  if (!PRESETS.includes(t.preset as Preset)) throw Error('Choose a supported prepared test.');
  return Object.freeze({format:'mathos-test-field', version:1, name:c.name,
    seed:integer(c.seed,0,0xffffffff,'Seed'),
    world:Object.freeze({width:integer(w.width,16,64,'Width'),height:integer(w.height,16,48,'Height')}),
    rules:Object.freeze({foodEnergy:integer(r.foodEnergy,1,96,'Food energy'),sunlight:integer(r.sunlight,0,8,'Food spawn attempts'),upkeep:integer(r.upkeep,1,3,'Upkeep')}),
    organisms:Object.freeze({startingEnergy:integer(o.startingEnergy,40,300,'New organism energy'),learning:boolean(o.learning,'Learning'),structuralMutation:boolean(o.structuralMutation,'Body mutation')}),
    test:Object.freeze({preset:t.preset as Preset,steps:integer(t.steps,1,1600,'Test steps')})});
}
export function presetConfig(preset: Preset): Configuration {
  return validateConfig({format:'mathos-test-field',version:1,name:`${preset[0]!.toUpperCase()+preset.slice(1)} test`,seed:42,
    world:{width:32,height:24},rules:{foodEnergy:preset==='inheritance'?48:24,sunlight:2,upkeep:1},
    organisms:{startingEnergy:preset==='growth'?240:preset==='inheritance'?300:120,learning:true,structuralMutation:preset==='inheritance'},
    test:{preset,steps:200}});
}
export function serializeConfig(config: Configuration): string { return JSON.stringify(validateConfig(config),null,2)+'\n'; }
export function parseConfig(text: string): Configuration {
  if (new TextEncoder().encode(text).length > 65536) throw Error('Configuration exceeds64KiB.');
  return validateConfig(JSON.parse(text));
}
export function needsRestart(a: Configuration, b: Configuration): boolean {
  return a.seed!==b.seed || a.world.width!==b.world.width || a.world.height!==b.world.height || a.test.preset!==b.test.preset;
}
export const PRESET_HELP: Record<Preset,string> = {
  feeding:'One mature grazer with nearby food. Watch heading, movement, intake and energy. Learning may explore; movement alone is not evidence of learning.',
  growth:'Two juveniles with resources. Watch cells develop before a motor permits movement. Compare real learning updates after the motor develops.',
  inheritance:'Four mature bodies with richer food. Watch reproduction and inherited variation. Mutations are possible, not guaranteed in every run.',
  empty:'An empty controlled field. Place food and organisms using the tools or coordinate controls, then run your own test.',
};
