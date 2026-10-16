import type { WorldState } from '../simulation/state.ts';

export type Palette = 'spectrum' | 'thermal' | 'grayscale';
const stops: Record<Palette, number[][]> = {
  spectrum: [[8, 16, 30], [76, 41, 150], [35, 119, 195], [45, 210, 193], [251, 216, 123]],
  thermal: [[9, 13, 26], [78, 32, 116], [185, 50, 123], [245, 126, 68], [255, 236, 166]],
  grayscale: [[12, 17, 25], [71, 75, 81], [130, 133, 138], [190, 192, 195], [249, 250, 252]],
};
// Small render-only lookup tables; palette changes never touch simulation state.
const tables = Object.fromEntries(Object.entries(stops).map(([name, colors]) => {
  const table = new Uint8ClampedArray(256 * 3);
  for (let value = 0; value < 256; value++) {
    const position = value / 255 * (colors.length - 1);
    const index = Math.min(Math.floor(position), colors.length - 2), fraction = position - index;
    for (let channel = 0; channel < 3; channel++) table[value * 3 + channel] = Math.round(colors[index]![channel]! * (1 - fraction) + colors[index + 1]![channel]! * fraction);
  }
  return [name, table];
})) as Record<Palette, Uint8ClampedArray>;

export function drawField(canvas: HTMLCanvasElement, snapshot: WorldState, palette: Palette = 'spectrum') {
  const { width, height } = snapshot.definition.universe;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return;
  const image = context.createImageData(width, height);
  const table = tables[palette];
  for (let i = 0; i < snapshot.field.length; i++) {
    const index = (snapshot.field[i]! >>> 8) * 3;
    image.data[i * 4] = table[index]!;
    image.data[i * 4 + 1] = table[index + 1]!;
    image.data[i * 4 + 2] = table[index + 2]!;
    image.data[i * 4 + 3] = 255;
  }
  context.putImageData(image, 0, 0);
}
