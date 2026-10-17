import type {CSSProperties} from 'react';
import tokens from './tokens.json';

/** View contract only. Never import presentation into the simulation or its reports. */
export const PRESENTATION = tokens;
const cssName = (name:string) => name.replace(/[A-Z]/g, c=>`-${c.toLowerCase()}`);
export const PRESENTATION_STYLE = Object.fromEntries(
  Object.entries(tokens.interface).map(([name,value])=>[`--mathos-${cssName(name)}`,value])
    .concat(Object.entries(tokens.shape).map(([name,value])=>[`--mathos-radius-${name}`,value]))
    .concat(Object.entries(tokens.space).map(([name,value])=>[`--mathos-space-${name}`,value]))
    .concat(Object.entries(tokens.motion).map(([name,value])=>[`--mathos-motion-${name}`,value])),
) as CSSProperties;
