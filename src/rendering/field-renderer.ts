import type { WorldState } from '../simulation/state.ts';

export function drawField(canvas: HTMLCanvasElement, snapshot: WorldState) {
  const { width, height } = snapshot.definition.universe;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return;
  const image = context.createImageData(width, height);
  for (let i = 0; i < snapshot.field.length; i++) {
    const level = snapshot.field[i]! / 65535;
    image.data[i * 4] = Math.round(16 + 222 * level);
    image.data[i * 4 + 1] = Math.round(41 + 182 * level);
    image.data[i * 4 + 2] = Math.round(31 + 121 * level);
    image.data[i * 4 + 3] = 255;
  }
  context.putImageData(image, 0, 0);
}
