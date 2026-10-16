import { useState } from 'react';
import type { WorldState } from '../simulation/state';

export function FieldInspector({ snapshot }: { snapshot: WorldState }) {
  const [x, setX] = useState('0');
  const [y, setY] = useState('0');
  const { width, height } = snapshot.definition.universe;
  const nx = x === '' ? NaN : Number(x), ny = y === '' ? NaN : Number(y);
  const valid = Number.isInteger(nx) && Number.isInteger(ny) && nx >= 0 && nx < width && ny >= 0 && ny < height;
  return <section aria-labelledby="inspector-title">
    <h3 id="inspector-title">Pixel inspector</h3>
    <div className="dimensions">
      <div><label htmlFor="pixel-x">Pixel x</label><input id="pixel-x" type="number" min="0" max={width - 1} step="1" value={x} onChange={(e) => setX(e.target.value)} /></div>
      <div><label htmlFor="pixel-y">Pixel y</label><input id="pixel-y" type="number" min="0" max={height - 1} step="1" value={y} onChange={(e) => setY(e.target.value)} /></div>
    </div>
    <p>Value: <strong data-testid="pixel-value">{valid ? snapshot.field[ny * width + nx] : 'Enter coordinates inside the grid.'}</strong></p>
    <p className="hint">Top-left origin, x right, y down. Values are abstract resource units.</p>
  </section>;
}
