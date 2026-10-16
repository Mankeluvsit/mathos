export function drawPixelPreview(canvas: HTMLCanvasElement, width: number, height: number): void {
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      context.fillStyle = (x + y) % 2 === 0 ? '#10243a' : '#142c43';
      context.fillRect(x, y, 1, 1);
    }
  }
}
